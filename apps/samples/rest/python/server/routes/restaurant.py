#   Copyright 2026 UCP Authors
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

"""Restaurant discovery routes for merchants and menus."""

from __future__ import annotations

from typing import Any

import config
import db
from fastapi import APIRouter, Body, HTTPException, Path
from ucp_sdk.models._internal import Response, Response_1, Version
from ucp_sdk.models.schemas.restaurant import menu as menu_models
from ucp_sdk.models.schemas.restaurant import merchant as merchant_models

router = APIRouter()


def build_ucp_response(capabilities: list[str]) -> Response_1:
  version = Version(config.get_server_version())
  caps = [Response(name=name, version=version) for name in capabilities]
  return Response_1(version=version, capabilities=caps)


async def build_menu_items_by_id(
  session,
) -> dict[str, dict[str, Any]]:
  items = await db.list_commerce_menu_items(session)
  modifier_groups = await db.list_commerce_modifier_groups(session)
  modifier_options = await db.list_commerce_modifier_options(session)
  item_group_links = await db.list_commerce_item_modifier_groups(session)

  options_by_group: dict[str, list[dict[str, Any]]] = {}
  for option in modifier_options:
    options_by_group.setdefault(option.modifier_group_id, []).append(
      {"item_id": option.item_id}
    )

  groups_by_id: dict[str, dict[str, Any]] = {}
  for group in modifier_groups:
    groups_by_id[group.id] = {
      "id": group.id,
      "name": group.name,
      "minimum_selections": group.minimum_selections,
      "maximum_selections": group.maximum_selections,
      "modifier_options": options_by_group.get(group.id, []),
    }

  groups_by_item: dict[str, list[dict[str, Any]]] = {}
  for link in item_group_links:
    group = groups_by_id.get(link.modifier_group_id)
    if not group:
      continue
    groups_by_item.setdefault(link.item_id, []).append(group)

  items_by_id: dict[str, dict[str, Any]] = {}
  for item in items:
    item_dict = {
      "id": item.id,
      "name": item.name,
      "description": {"plain": item.description_plain},
      "price": {
        "amount": item.price_amount,
        "currency": item.price_currency,
      },
    }
    if item.id in groups_by_item:
      item_dict["modifier_groups"] = groups_by_item[item.id]
    items_by_id[item.id] = item_dict

  return items_by_id


async def build_categories(session) -> list[dict[str, Any]]:
  categories = await db.list_commerce_menu_categories(session)
  category_items = await db.list_commerce_category_items(session)
  items_by_id = await build_menu_items_by_id(session)

  item_ids_by_category: dict[str, list[str]] = {}
  for link in category_items:
    item_ids_by_category.setdefault(link.category_id, []).append(link.item_id)

  category_list: list[dict[str, Any]] = []
  for category in categories:
    item_ids = item_ids_by_category.get(category.id, [])
    items = [items_by_id[item_id] for item_id in item_ids if item_id in items_by_id]
    category_list.append(
      {"id": category.id, "name": category.name, "items": items}
    )

  return category_list


@router.post(
  "/merchants/search",
  response_model=merchant_models.SearchResponse,
  operation_id="search_merchants",
)
async def search_merchants(
  payload: merchant_models.SearchRequest = Body(...),
) -> dict[str, Any]:
  query = payload.query.lower()
  async with db.manager.products_session_factory() as session:
    merchants = await db.list_commerce_merchants(session)
  merchant_dicts = [
    {
      "id": merchant.id,
      "name": merchant.name,
      "description": {"plain": merchant.description_plain},
      "url": merchant.url,
      "category": merchant.category,
      "tags": merchant.tags or [],
    }
    for merchant in merchants
    if query in merchant.name.lower()
  ]
  return merchant_models.SearchResponse(
    ucp=build_ucp_response(["xyz.localprotocol.restaurant.merchant"]),
    merchants=merchant_dicts,
  ).model_dump(mode="json", by_alias=True)


@router.get(
  "/merchants/{id}",
  response_model=merchant_models.GetMerchantResponse,
  operation_id="get_merchant",
)
async def get_merchant(
  merchant_id: str = Path(..., alias="id"),
) -> dict[str, Any]:
  async with db.manager.products_session_factory() as session:
    merchant = await db.get_commerce_merchant(session, merchant_id)
  if not merchant:
    raise HTTPException(status_code=404, detail="Merchant not found")
  return merchant_models.GetMerchantResponse(
    ucp=build_ucp_response(["xyz.localprotocol.restaurant.merchant"]),
    merchant={
      "id": merchant.id,
      "name": merchant.name,
      "description": {"plain": merchant.description_plain},
      "url": merchant.url,
      "category": merchant.category,
      "tags": merchant.tags or [],
    },
  ).model_dump(mode="json", by_alias=True)


@router.get(
  "/merchants/{id}/menus",
  response_model=menu_models.ListResponse,
  operation_id="get_merchant_menus",
)
async def get_merchant_menus(
  merchant_id: str = Path(..., alias="id"),
) -> dict[str, Any]:
  async with db.manager.products_session_factory() as session:
    merchant = await db.get_commerce_merchant(session, merchant_id)
    if not merchant:
      raise HTTPException(status_code=404, detail="Merchant not found")
    categories = await build_categories(session)
  return menu_models.ListResponse(
    ucp=build_ucp_response(["xyz.localprotocol.restaurant.menu"]),
    categories=categories,
  ).model_dump(mode="json", by_alias=True)


@router.post(
  "/menu/search",
  response_model=menu_models.SearchResponse,
  operation_id="search_menu",
)
async def search_menu(
  payload: menu_models.SearchRequest = Body(...),
) -> dict[str, Any]:
  query = payload.query.lower()
  async with db.manager.products_session_factory() as session:
    categories = await build_categories(session)
  matched_categories = []
  for category in categories:
    matched_items = [
      item
      for item in category["items"]
      if query in item["name"].lower()
    ]
    if matched_items:
      matched_categories.append({**category, "items": matched_items})
  return menu_models.SearchResponse(
    ucp=build_ucp_response(["xyz.localprotocol.restaurant.menu"]),
    categories=matched_categories,
  ).model_dump(mode="json", by_alias=True)


@router.get(
  "/menu/items",
  response_model=menu_models.ListResponse,
  operation_id="list_menu_items",
)
async def list_menu_items() -> dict[str, Any]:
  async with db.manager.products_session_factory() as session:
    categories = await build_categories(session)
  return menu_models.ListResponse(
    ucp=build_ucp_response(["xyz.localprotocol.restaurant.menu"]),
    categories=categories,
  ).model_dump(mode="json", by_alias=True)


@router.get(
  "/menu/items/{id}",
  response_model=menu_models.GetItemResponse,
  operation_id="get_menu_item",
)
async def get_menu_item(
  item_id: str = Path(..., alias="id"),
) -> dict[str, Any]:
  async with db.manager.products_session_factory() as session:
    item = await db.get_commerce_menu_item(session, item_id)
    if not item:
      raise HTTPException(status_code=404, detail="Menu item not found")
    items_by_id = await build_menu_items_by_id(session)
    item_dict = items_by_id[item_id]
  return menu_models.GetItemResponse(
    ucp=build_ucp_response(["xyz.localprotocol.restaurant.menu"]),
    item=item_dict,
  ).model_dump(mode="json", by_alias=True)


@router.get(
  "/menu/items/{id}/modifier-groups",
  response_model=menu_models.GetItemModifierGroupsResponse,
  operation_id="get_item_modifier_groups",
)
async def get_item_modifier_groups(
  item_id: str = Path(..., alias="id"),
) -> dict[str, Any]:
  async with db.manager.products_session_factory() as session:
    item = await db.get_commerce_menu_item(session, item_id)
    if not item:
      raise HTTPException(status_code=404, detail="Menu item not found")
    items_by_id = await build_menu_items_by_id(session)
    groups = items_by_id.get(item_id, {}).get("modifier_groups", [])
  return menu_models.GetItemModifierGroupsResponse(
    ucp=build_ucp_response(["xyz.localprotocol.restaurant.menu"]),
    modifier_groups=groups,
  ).model_dump(mode="json", by_alias=True)


@router.get(
  "/menu/modifiers/{id}",
  response_model=menu_models.GetModifierItemResponse,
  operation_id="get_modifier_item",
)
async def get_modifier_item(
  modifier_item_id: str = Path(..., alias="id"),
) -> dict[str, Any]:
  async with db.manager.products_session_factory() as session:
    modifier_item = await db.get_commerce_modifier_item(
      session, modifier_item_id
    )
  if not modifier_item:
    raise HTTPException(status_code=404, detail="Modifier item not found")
  return menu_models.GetModifierItemResponse(
    ucp=build_ucp_response(["xyz.localprotocol.restaurant.menu"]),
    modifier_item={
      "id": modifier_item.id,
      "title": modifier_item.title,
      "price": {
        "amount": modifier_item.price_amount,
        "currency": modifier_item.price_currency,
      },
    },
  ).model_dump(mode="json", by_alias=True)
