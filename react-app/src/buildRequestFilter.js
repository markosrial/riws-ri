import {getGeoPosition} from './App';

function getTermFilterValue(field, fieldValue) {

  if (fieldValue === "false" || fieldValue === "true") {
    return { [field]: fieldValue === "true" };
  }

  return { [`${field}.keyword`]: fieldValue };
}

function getTermFilter(filter) {
  if (filter.type === "any") {
    return {
      bool: {
        should: filter.values.map(filterValue => ({
          term: getTermFilterValue(filter.field, filterValue)
        })),
        minimum_should_match: 1
      }
    };
  } else if (filter.type === "all") {
    return {
      bool: {
        filter: filter.values.map(filterValue => ({
          term: getTermFilterValue(filter.field, filterValue)
        }))
      }
    };
  }
}

function getRangeFilter(filter) {
  if (filter.type === "any") {
    return {
      bool: {
        should: filter.values.map(filterValue => ({
          range: {
            [filter.field]: {
              ...(filterValue.to && { lt: filterValue.to }),
              ...(filterValue.from && { gt: filterValue.from })
            }
          }
        })),
        minimum_should_match: 1
      }
    };
  } else if (filter.type === "all") {
    return {
      bool: {
        filter: filter.values.map(filterValue => ({
          range: {
            [filter.field]: {
              ...(filterValue.to && { lt: filterValue.to }),
              ...(filterValue.to && { gt: filterValue.from })
            }
          }
        }))
      }
    };
  }
}

function getGeoLocationFilter(filter) {
  if (filter.type === "any") {
    return {
      geo_distance: {
        distance: `${filter.values[0].to}`,
        unit: "km",
        geo_location: {
          lat: getGeoPosition().latitude,
          lon: getGeoPosition().longitude
        }
      }
    };
  }
}

const transformTicketField = filter => ({...filter, field: `tickets.${filter.field}`})


export default function buildRequestFilter(filters) {
  if (!filters) return;

  filters = filters.reduce((acc, filter) => {
    if (["artists", "genre", "place"].includes(filter.field)) {
      return [...acc, getTermFilter(filter)];
    }
    if (["price", "date"].includes(filter.field)) {
      return [...acc, getRangeFilter(transformTicketField(filter))];
    }
    if (["geo_location"].includes(filter.field)) {
      let locationFilter = getGeoLocationFilter(filter);
      if (locationFilter) {
        return [...acc, locationFilter];
      }
    }
    return acc;
  }, []);

  if (filters.length < 1) return;
  return filters;
}
