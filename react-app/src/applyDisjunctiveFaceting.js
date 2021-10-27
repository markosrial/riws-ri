import runRequest from "./runRequest";
import buildRequest from "./buildRequest";

function combineAggregationsFromResponses(responses) {
  return responses.reduce((acc, response) => {
    return {
      ...acc,
      ...response.aggregations
    };
  }, {});
}

function removeFilterByName(state, facetName) {
  return {
    ...state,
    filters: state.filters.filter(f => f.field !== facetName)
  };
}

function removeAllFacetsExcept(body, facetName) {
  return {
    ...body,
    aggs: {
      [facetName]: body.aggs[facetName]
    }
  };
}

function changeSizeToZero(body) {
  return {
    ...body,
    size: 0
  };
}

async function getDisjunctiveFacetCounts(state, disunctiveFacetNames) {
  const responses = await Promise.all(
    disunctiveFacetNames.map(facetName => {
      let newState = removeFilterByName(state, facetName);
      let body = buildRequest(newState);
      body = changeSizeToZero(body);
      body = removeAllFacetsExcept(body, facetName);
      return runRequest(body);
    })
  );
  return combineAggregationsFromResponses(responses);
}

export default async function applyDisjunctiveFaceting(
  json,
  state,
  disunctiveFacetNames
) {
  const disjunctiveFacetCounts = await getDisjunctiveFacetCounts(
    state,
    disunctiveFacetNames
  );

  return {
    ...json,
    aggregations: {
      ...json.aggregations,
      ...disjunctiveFacetCounts
    }
  };
}
