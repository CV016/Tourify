/* eslint-disable */



export const displayMapBox = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiY3YwMTYiLCJhIjoiY2x5Zmxrc25tMDB0NTJsczIxZ2FtbXlncyJ9.ZGEExdqFuZoTykXmzQuh4A';
  const map = new mapboxgl.Map({
    container: 'map',
    //   style: 'mapbox://styles/cv016/clyfm07ax00r201pf4p0lh8xa', Dark-Map
    style: 'mapbox://styles/cv016/clyfm4prr00sn01nwfq229b2o', // Light-Map
    // scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create Marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add Marker

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup

    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
