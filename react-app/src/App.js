import React, {useEffect} from "react";

import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  WithSearch,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  Sorting
} from "@elastic/react-search-ui";
import {Layout, SingleLinksFacet, SingleSelectFacet} from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

import buildRequest from "./buildRequest";
import runRequest from "./runRequest";
import applyDisjunctiveFaceting from "./applyDisjunctiveFaceting";
import buildState from "./buildState";
import ResultView from './ResultView';

const config = {
  debug: false,
  hasA11yNotifications: true,
  onResultClick: () => {
    /* Not implemented */
  },
  onAutocompleteResultClick: () => {
    /* Not implemented */
  },
  onAutocomplete: async () => {
    /* Not implemented */
  },
  onSearch: async state => {
    const { resultsPerPage } = state;
    const requestBody = buildRequest(state);
    // Note that this could be optimized by running all of these requests
    // at the same time. Kept simple here for clarity.
    const responseJson = await runRequest(requestBody);
    const responseJsonWithDisjunctiveFacetCounts = await applyDisjunctiveFaceting(
      responseJson,
      state,
      ["artists", "genre", "place", "geo_location", "price", "date"]
    );
    return buildState(responseJsonWithDisjunctiveFacetCounts, resultsPerPage);
  },
  alwaysSearchOnInitialLoad: true
};

let geo = {
  coords: {
    latitude: 0.00,
    longitude: 0.00
  }
};

export const getGeoPosition = () => geo.coords;

export default function App() {

  useEffect(() => {
      navigator.geolocation.getCurrentPosition(function(position) {
        geo = position
      });
  }, [])

  return (
    <SearchProvider config={config}>
      <WithSearch mapContextToProps={({ wasSearched }) => ({ wasSearched })}>
        {({ wasSearched }) => (
          <div className="App">
            <ErrorBoundary>
              <Layout
                header={
                  <SearchBox
                    autocompleteMinimumCharacters={3}
                    autocompleteSuggestions={false}
                    inputView={({ getAutocomplete, getInputProps, getButtonProps }) => (
                        <>
                          <div className="sui-search-box__wrapper">
                            <input
                                {...getInputProps({
                                  placeholder: "Escribe aquí para encontrar tu concierto..."
                                })}
                            />
                            {getAutocomplete()}
                          </div>
                          <input
                              {...getButtonProps({
                                value: "Buscar"
                              })}
                          />
                        </>
                    )}
                  />
                }
                sideContent={
                  <div>
                    {wasSearched && (
                      <Sorting
                        label={"Ordenar por"}
                        sortOptions={[
                          {
                            name: "Relevancia",
                            value: "",
                            direction: ""
                          },
                          {
                            name: "Artistas ↑",
                            value: "artists",
                            direction: "asc"
                          },
                          {
                            name: "Artistas ↓",
                            value: "artists",
                            direction: "desc",
                          },
                          {
                            name: "Género ↑",
                            value: "genre",
                            direction: "asc"
                          },
                          {
                            name: "Género ↓",
                            value: "genre",
                            direction: "desc",
                          },
                        ]}
                      />
                    )}
                    <Facet
                        field="geo_location"
                        label="Distancia"
                        filterType="any"
                        view={SingleLinksFacet}
                    />
                    <Facet
                        field="artists"
                        label="Artistas"
                        filterType="any"
                        isFilterable={true}
                    />
                    <Facet
                        field="genre"
                        label="Género"
                        filterType="any"
                    />
                    <Facet
                        field="price"
                        label="Precio"
                        filterType="any"
                    />
                    <Facet
                        field="date"
                        label="Fechas (rango desde hoy)"
                        filterType="any"
                        view={SingleSelectFacet}
                    />
                    <Facet
                        field="place"
                        label="Recinto"
                        filterType="any"
                        isFilterable={true}
                    />
                    {/*<Facet
                      field="states"
                      label="States"
                      filterType="any"
                      isFilterable={true}
                    />
                    <Facet
                      field="world_heritage_site"
                      label="World Heritage Site?"
                    />
                    <Facet field="visitors" label="Visitors" filterType="any" />
                    <Facet
                      field="acres"
                      label="Acres"
                      view={SingleSelectFacet}
                    />*/}
                  </div>
                }
                bodyContent={
                  <Results
                    titleField="title"
                    resultView={ResultView}
                  />
                }
                bodyHeader={
                  <React.Fragment>
                    {wasSearched && <PagingInfo
                        view={({ start, end, totalResults, searchTerm }) => (
                            <div className="paging-info">
                              Mostrando <strong>{start} - {end}</strong> de <strong>{totalResults}</strong> {searchTerm && <span>para: <i>{searchTerm}</i></span>}
                            </div>
                        )}
                    />}
                    {wasSearched && <ResultsPerPage/>}
                  </React.Fragment>
                }
                bodyFooter={<Paging />}
              />
            </ErrorBoundary>
          </div>
        )}
      </WithSearch>
    </SearchProvider>
  );
}
