"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const missingImage = "http://tinyurl.com/tv-missing"





/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm() {
  // Make request to TVMaze search shows API.
  const $term = $('#search-query').val();
  const res = await axios.get(`https://api.tvmaze.com/search/shows?q=${$term}`);
  const showsArray = [];
  for (let i = 0; i<res.data.length; i++) {
    const theShow = res.data[i].show;
    if (theShow.image){
      showsArray.push({
        id: theShow.id,
        name: theShow.name,
        summary: theShow.summary,
        image: theShow.image ? theShow.image.medium : missingImage,
      });
    } 
  }
  return showsArray;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}"  
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const epi = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  return epi.data.map(ep => ({
    id: ep.id,
    name: ep.name,
    season: ep.season,
    number: ep.number,
  }));
}


/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  
  $('ul').empty();

  for (let episode of episodes) {
    const $li = $(`<li> ${episode.name} (season ${episode.season}, episode ${episode.number})</li>`);
    $('ul').append($li);
  }
  $episodesArea.show();
}

async function getEpisodesandDisplay(e) {
  const showID = $(e.target).closest(".Show").data('show-id');
  const episodes = await getEpisodesOfShow(showID);
  populateEpisodes(episodes);
}

$showsList.on('click', '.get-episodes', getEpisodesandDisplay);
// $('shows-list').on('click', '.get-episodes', async function handleEpClick(e) {
//   let showId = $(e.target).closest('.Show').data('show-id');
//   let episodes = await getEpisodesOfShow(showId);
//   populateEpisodes(episodes);
// });

