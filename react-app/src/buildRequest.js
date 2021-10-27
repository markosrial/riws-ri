import buildRequestFilter from "./buildRequestFilter";
import {getGeoPosition} from './App';

function buildFrom(current, resultsPerPage) {
  if (!current || !resultsPerPage) return;
  return (current - 1) * resultsPerPage;
}

function buildSort(sortDirection, sortField) {
  if (sortDirection && sortField) {
    return [{ [`${sortField}.keyword`]: sortDirection }];
  }
}

function buildMatch(searchTerm) {
  return searchTerm
    ? {
        multi_match: {
          query: searchTerm,
          fields: ["title^3", "description", "artists^2", "place^2", "genre"]
        }
      }
    : { match_all: {} };
}

export default function buildRequest(state) {
  const {
    current,
    filters,
    resultsPerPage,
    searchTerm,
    sortDirection,
    sortField
  } = state;

  const sort = buildSort(sortDirection, sortField);
  const match = buildMatch(searchTerm);
  const size = resultsPerPage;
  const from = buildFrom(current, resultsPerPage);
  const filter = buildRequestFilter(filters);

  const body = {
    _source: ["title", "artists", "image", "place", "address", "geo_location", "genre", "description", "rating_score", "rating_num", "origin", "tickets"],
    aggs: {
      artists: { terms: { field: "artists.keyword", size: 50 } },
      genre: { terms: { field: "genre.keyword", size: 30 } },
      place: { terms: { field: "place.keyword", size: 50 } },
      geo_location: {
        geo_distance: {
          field: "geo_location",
          origin: `${getGeoPosition().latitude}, ${getGeoPosition().longitude}`,
          unit: "km",
          ranges: [
            { to: 10, key: "< 10Km" },
            { to: 100, key: "< 100Km" },
            { to: 500, key: "< 500Km" },
            { to: 1000, key: "< 1000Km" },
          ]
        }
      },
      price: {
        range: {
          field: "tickets.price",
          ranges: [
            { from: 0.0, to: 20.0, key: "0 - 20 EUR" },
            { from: 20.0, to: 50.0, key: "20 - 50 EUR" },
            { from: 50.0, to: 100.0, key: "50 - 100 EUR" },
            { from: 100.0, key: "Más de 100 EUR" },
          ]
        }
      },
      date: {
        range: {
          field: "tickets.date",
          ranges: [
            { from: 'now/d', to: 'now+7d/d', key: "7 días" },
            { from: 'now/d', to: 'now+30d/d', key: "1 mes" },
            { from: 'now/d', to: 'now+90d/d', key: "3 meses" },
            { from: 'now/d', to: 'now+366d/d', key: "1 año" },
          ]
        }
      },
    },
    query: {
      bool: {
        must: [match],
        ...(filter && { filter })
      }
    },
    ...(sort && { sort }),
    ...(size && { size }),
    ...(from && { from })
  };

  return body;
}
