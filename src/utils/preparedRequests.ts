"use strict";
import axios from "axios";
import { generateXCSRFToken } from "./token";

import proxies from "./proxies.json";
import { Item } from "../types";

const axiosInstance = axios.create();

const prepareExtraConfig = () => {
  /* 
   I think the easiest is to add it here, 
   so every request will use a different proxy, 
   but the best way should do at least 3 to 5 requests in the same proxy,
   then change, or something similar.
  */
  let extraConfig = {};
  if (proxies.length > 0) {
    const random_index = Math.floor(Math.random() * proxies.length);
    const random_proxy = proxies[random_index];
    extraConfig = {
      proxy: random_proxy,
    };
  }
  return extraConfig;
};

export const getItems = async () => {
  const config = {
    method: "get",
    url: "https://catalog.roblox.com/v1/search/items?category=All&limit=120&maxPrice=0&minPrice=0&salesTypeFilter=2&sortType=4",
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
      cookie: process.env.ROBLOX_COOKIES,
    },
    ...prepareExtraConfig(),
  };
  const response = await axiosInstance(config).catch((err) => {
    console.log("Could not get items", JSON.stringify(err.response.data));
    return err.response;
  });
  return response.data.data;
};

export const getItemDetails = async (itemData: Item) => {
  const config = {
    method: "post",
    url: "https://catalog.roblox.com/v1/catalog/items/details",
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
      cookie: process.env.ROBLOX_COOKIES,
      "x-csrf-token": await generateXCSRFToken(),
    },
    data: {
      items: [itemData],
    },
    ...prepareExtraConfig(),
  };
  const response = await axiosInstance(config).catch((err) => {
    console.log(
      "Could not get item details",
      JSON.stringify(err.response.data)
    );
    return err.response;
  });
  return response.data.data[0];
};

export const getMarketplaceDetails = async (ids: string[]) => {
  const config = {
    method: "post",
    url: "https://apis.roblox.com/marketplace-items/v1/items/details",
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
      cookie: process.env.ROBLOX_COOKIES,
      "x-csrf-token": await generateXCSRFToken(),
    },
    data: {
      itemIds: [ids],
    },
    ...prepareExtraConfig(),
  };
  const response = await axiosInstance(config).catch((err) => {
    console.log(
      "Could not get marketplace item details, probably because its not for sale yet.",
      JSON.stringify(err.response.data)
    );
    return err.response;
  });
  return response.data[0];
};

const buyItem = async (payload: { [key: string]: unknown }) => {
  const config: { [key: string]: unknown } = {
    method: "post",
    url: `https://apis.roblox.com/marketplace-sales/v1/item/${payload.collectibleItemId}/purchase-item`,
    headers: {
      authority: "economy.roblox.com",
      accept: "application/json, text/plain, */*",
      "accept-language": "pt-BR,pt;q=0.9",
      "content-type": "application/json;charset=UTF-8",
      cookie: process.env.ROBLOX_COOKIES,
      origin: "https://www.roblox.com",
      referer: "https://www.roblox.com/",
      "sec-ch-ua":
        '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
      "x-csrf-token": await generateXCSRFToken(),
    },
    data: payload,
    ...prepareExtraConfig(),
  };
  const response = await axios(config).catch((err) => {
    console.log("Could not buy item", JSON.stringify(err.response.data));
    return err;
  });
  return response.data;
};

export { buyItem };
