function sanitiseHTML(htmlString) {
  if (!htmlString) return null;

  // Initialize a new DOMParser instance
  const parser = new DOMParser();

  // Parse the HTML string
  const doc = parser.parseFromString(htmlString, 'text/html');

  // Remove any <script> tags to mitigate potential XSS attacks
  Array.from(doc.getElementsByTagName('script')).forEach((script) => script.remove());

  return doc.body.childNodes;
}
async function getContent(sURL) {
  if (!sURL) return null;
  let result = null;

  try {
    const url = new URL(sURL);
    const res = await fetch(url);
    const json = await res.json();
    result = sanitiseHTML(json?.data?.textBlockCfByPath?.item?.body?.html);
  } catch (error) {
    throw new Error('Failed to fetch CFRenderer query!');
  }

  return result;
}
export default async function decorate(block) {
  try {
    const queryElement = block.querySelector('a[href]');
    if (queryElement) {
      const queryURL = queryElement.href;
      const parentDiv = document.createElement('div');
      parentDiv.classList.add('cfrenderer-block');
      const nodeList = await getContent(queryURL);

      if (nodeList) {
        nodeList.forEach((node) => {
          parentDiv.appendChild(node.cloneNode(true));
        });

        queryElement.replaceWith(parentDiv);
      } else {
        throw new Error('No content retrieved.');
      }
    }
  } catch (error) {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('cfrenderer-error-block');
    errorDiv.append(document.createTextNode(`Error occurred! ${error.message}`));
    block.replaceWith(errorDiv);
  }
}
