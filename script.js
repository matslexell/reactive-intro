var refreshButton = document.querySelector('.refresh');

var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');

var startupRequestStream = Rx.Observable.just('https://api.github.com/users');

var requestOnRefreshStream = refreshClickStream
  .map(ev => {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });

var responseStream = requestOnRefreshStream.merge(startupRequestStream)
  .flatMap(requestUrl => {
    console.log("request")
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl))
  })
  .shareReplay(1);

function createSuggestionStream(responseStream) {
  return responseStream.map(listUser => 
    listUser[Math.floor(Math.random()*listUser.length)]
  )
  .startWith(null)
  .merge(refreshClickStream.map(ev => null));
}

var suggestion1Stream = createSuggestionStream(responseStream);
var suggestion2Stream = createSuggestionStream(responseStream);
var suggestion3Stream = createSuggestionStream(responseStream);

renderSuggestion(null, '.suggestion1');
renderSuggestion(null, '.suggestion2');
renderSuggestion(null, '.suggestion3');

function renderSuggestion(suggestedUser, selector) {
  var suggestedEl = document.querySelector(selector);
  if(suggestedUser == null) {
    suggestedEl.style.visibility = 'hidden';
    return;
  }
  suggestedEl.style.visibility = 'visible';
  var usernameEl = suggestedEl.querySelector('.username');
  usernameEl.href = suggestedUser.html_url;
  usernameEl.textContent = suggestedUser.login;
  var imgEl = suggestedEl.querySelector('img');
  imgEl.src = "";
  imgEl.src = suggestedUser.avatar_url;
}


suggestion1Stream.subscribe(user => {
  renderSuggestion(user, '.suggestion1');
});

// suggestion2Stream.subscribe(user => {
//   renderSuggestion(user, '.suggestion2');
// });

// suggestion3Stream.subscribe(user => {
//   renderSuggestion(user, '.suggestion3');
// });