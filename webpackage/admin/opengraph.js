function extractOpenGraphFromDocument(doc) {
  const els = doc.head.querySelectorAll("meta[property^='og:']");
  const tags = {};

  for (let tag of els)
    tags[tag.attributes.property.value.substr(3)] = tag.content;
  return tags;
}

export function fetchOpenGraphFromUrl(url) {
  return fetch(`/admin/opengraph?url=${encodeURIComponent(url)}`).then(response => {
    return response.text();
  }).then(html => {
    const parser = new DOMParser();
    const data = extractOpenGraphFromDocument(
      new DOMParser().parseFromString(html, 'text/html')
    );

    if (!data.url) data.url = url;
    return data;
  });
}

export function createOpenGraphView(data) {
  console.log("createOpenGraphView from", data);
  if (window.cms && window.cms.createOpenGraphView)
    return window.cms.openGraphView(block);
  else {
    const wrapper = document.createElement("figure");
    const root = document.createElement("a");

    root.className = "opengraph-view";
    root.href = data.url;
    root.target = "_blank";
    if (data.type)
      root.dataset.type = data.type;
    if (data.image) {
      const image = document.createElement("img");
      image.src = data.image;
      image.className = "opengraph-thumbnail";
      if (data["image:width"]) { image.width = data["image:width"]; }
      if (data["image:height"]) { image.height = data["image:height"]; }
      root.appendChild(image);
    }
    if (data.title) {
      const title = document.createElement("h4");
      title.textContent = data.title;
      title.className = "opengraph-title";
      root.appendChild(title);
    }
    if (data.description) {
      const description = document.createElement("div");
      description.textContent = data.description;
      description.className = "opengraph-description";
      root.appendChild(description);
    }
    wrapper.appendChild(root);
    console.log("OpenGraphView", root);
    return wrapper.innerHTML;
  }
}
