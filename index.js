const button = document.querySelector("#button");
const input = document.querySelector("#port-input");
const checkbox = document.querySelector("#new-tab");

const DEFAULT_PORT = 3001;
const LANGUAGE_CODES = {
  es: "es-es",
  fr: "fr-fr",
  it: "it-it",
  de: "de-de",
  pt: "pt-pt",
  nl: "nl-nl",
  ar: "ar-ae",
};

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

button.addEventListener("click", () => {
  getCurrentTab()
    .then((tab) => {
      const prodUrl = new URL(tab.url);
      const finalLocalhostUrl = constructLocalhostUrl(prodUrl);
      if (checkbox.checked) {
        chrome.tabs.create({ url: finalLocalhostUrl });
      } else chrome.tabs.update(tab.id, { url: finalLocalhostUrl });
    })
    .catch((err) => {
      console.log(err);
    });
});

function constructLocalhostUrl(prodUrl) {
  const { host, pathname, search } = prodUrl;
  let lang = "en-us";

  /* Setting the search for the url */
  const finalsearch = search && "&" + search.substring(1, search.length);

  /* Setting the path for the url */
  const paths = pathname.split("/").filter((path) => {
    return path !== "";
  });
  const finalPath = paths.length > 0 ? getFinalPath(paths) : "";

  /* Setting the lang for the url */
  if (paths.length > 0 && LANGUAGE_CODES[paths[0]]) {
    lang = LANGUAGE_CODES[paths[0]];
  }

  /* Setting the port for the url */
  const port =
    Number.isNaN(+input.value) || input.value === ""
      ? DEFAULT_PORT
      : input.value;

  const finalLocalhostUrl = `http://localhost:${port}/?mystique_uid=${host}${finalPath}&lang=${lang}${finalsearch}`;

  return finalLocalhostUrl;
}

function getFinalPath(paths) {
  let finalPath = paths.length == 1 && LANGUAGE_CODES[paths[0]] ? "" : ".";
  const result = paths.reduce(
    (accumulator, currentValue, currentIndex, array) => {
      if (!LANGUAGE_CODES[paths[currentIndex]]) {
        accumulator += currentValue;
        if (currentIndex < array.length - 1) {
          accumulator += ".";
        }
      }
      return accumulator;
    },
    finalPath
  );
  return result;
}
