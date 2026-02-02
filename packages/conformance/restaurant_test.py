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

"""Restaurant capability tests for merchant and menu APIs."""

from absl.testing import absltest
import integration_test_utils
from ucp_sdk.models.schemas.restaurant import menu as menu_models
from ucp_sdk.models.schemas.restaurant import merchant as merchant_models


class RestaurantTest(integration_test_utils.IntegrationTestBase):
  """Tests for restaurant merchant and menu endpoints."""

  def test_search_merchants(self) -> None:
    payload = merchant_models.SearchRequest(query="bistro")
    response = self.client.post(
      "/merchants/search",
      json=payload.model_dump(mode="json", by_alias=True, exclude_none=True),
      headers=self.get_headers(),
    )
    self.assert_response_status(response, 200)
    data = merchant_models.SearchResponse(**response.json())
    self.assertTrue(data.merchants, "Expected at least one merchant")

  def test_get_merchant_and_menus(self) -> None:
    response = self.client.post(
      "/merchants/search",
      json={"query": "bistro"},
      headers=self.get_headers(),
    )
    self.assert_response_status(response, 200)
    merchant_id = response.json()["merchants"][0]["id"]

    response = self.client.get(
      f"/merchants/{merchant_id}",
      headers=self.get_headers(),
    )
    self.assert_response_status(response, 200)
    merchant_models.GetMerchantResponse(**response.json())

    response = self.client.get(
      f"/merchants/{merchant_id}/menus",
      headers=self.get_headers(),
    )
    self.assert_response_status(response, 200)
    menu_models.ListResponse(**response.json())

  def test_menu_search_and_item(self) -> None:
    response = self.client.post(
      "/menu/search",
      json={"query": "burger"},
      headers=self.get_headers(),
    )
    self.assert_response_status(response, 200)
    menu_models.SearchResponse(**response.json())

    item_id = response.json()["categories"][0]["items"][0]["id"]

    response = self.client.get(
      f"/menu/items/{item_id}",
      headers=self.get_headers(),
    )
    self.assert_response_status(response, 200)
    menu_models.GetItemResponse(**response.json())

  def test_modifier_groups_and_modifier_item(self) -> None:
    response = self.client.get("/menu/items", headers=self.get_headers())
    self.assert_response_status(response, 200)
    item_id = response.json()["categories"][0]["items"][0]["id"]

    response = self.client.get(
      f"/menu/items/{item_id}/modifier-groups",
      headers=self.get_headers(),
    )
    self.assert_response_status(response, 200)
    menu_models.GetItemModifierGroupsResponse(**response.json())

    modifier_groups = response.json()["modifier_groups"]
    self.assertTrue(modifier_groups, "Expected modifier groups")
    modifier_item_id = modifier_groups[0]["modifier_options"][0]["item_id"]

    response = self.client.get(
      f"/menu/modifiers/{modifier_item_id}",
      headers=self.get_headers(),
    )
    self.assert_response_status(response, 200)
    menu_models.GetModifierItemResponse(**response.json())

  def test_checkout_with_modifier_selections(self) -> None:
    payload = self.create_checkout_payload(include_fulfillment=False)
    payload_dict = payload.model_dump(
      mode="json", by_alias=True, exclude_none=True
    )
    payload_dict["line_items"][0]["modifier_selections"] = [
      {
        "modifier_group_id": "mod_group_1",
        "selections": [{"item_id": "mod_item_1", "quantity": 1}],
      }
    ]

    response = self.client.post(
      "/checkout-sessions",
      json=payload_dict,
      headers=self.get_headers(),
    )
    self.assert_response_status(response, [200, 201])

    line_item = response.json()["line_items"][0]
    self.assertIn("modifier_selections", line_item)


if __name__ == "__main__":
  absltest.main()
