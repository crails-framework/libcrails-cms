import GridComponentEditor from "./grid_component_editor.js";
    
const defaultImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAAlwSFlzAAAbrwAAG68BXhqRHAAAAAd0SU1FB9oMDwEGDcvL2bIAAAAGYktHRAD/AP8A/6C9p5MAAAVISURBVHja7ZYDkCvbFoa/3d1Bx8nMqYyta9t+tm2WX9n1Ss9l17Ntm9fGsX3GiDrda73BvrnItXG+qrUxk+T/1zbHeb4xpVIpOzc3NwUkeW6pr2pvMcDZqnozzwPGmHM8IAHwwU2vIF/7O0HGRUoOS3tOollLoShdlBkpDjE//l+SnbeSdxR/uciEfxl/PP1tbN40hhuFoAKqthYMti0RqAKKUWG5Uue3n381QMLDki/sITXQje+vECaS0CgS7PJxDHT2dJJJZ1k6pUJ5tJNSWGSkq0Tq6ADFu66n3DtEw3gYEbCiqorD/YZcsP9zrEkLDhbpaeDkhGY+T5BpgjuHHSaSboLD2TrfnYmzP+zm5MvT9JwxwUxykXMzCww05lEMTwQr3W5gNt3kSEcfJj7HMbeTPV4Jg+LFPOKuh4uDH8X46V6fWm6Spj/Asns7XeNKkhhPFQfLDkkyfaSTHe4g/5pXlqljgLgXI+Z6jB/L8Jkdb2S0b5i/LZ3B1/+3G783iektMZdIY1CeONJuIPR66bgzy54jRYqVLEMHiiiQiCdwjQfAcCXH+xdeQee38uxoFMgPns7h8oUcdBIYAPOgcVZthaoCtm/DgoclP/E++PPvmdjaQWIpRzxQ1EAyEScuHp66xEtJRv9myO0qMP26k3DyaX55Tz+iBlcVZENIsfWDBAXF0DLUPgL5qdeSGC+TmWniBQ4zGZ/fDQnfOG2evxcOrY9EMwhhX4PEVJ5z+nr40U2jzNZ9jEYbkkYRtSKtENSaUxEUQVXaDeA4uG8+g6CjSco9xkDzRqaOzlC8b5BbVjZzX3YXztGIbFeB9DvmyO+BQyspjBEwWFFANwRUbKz3I0QidDUk2mi3GTAqrIy/gco159LnZRhM5znXXeQTc38mFRxioXAUTsmQ+vJB9mZn+dbhTdg8NjKlJb4uohoishrRaoQhKiFRZPvNAEvdo8XG0OWu+wTbRsaYueez9K3U8UyB+KxP4cQhDr6pyua5IjeFp9F0DY7Y4aUlbrMM12ujG1mzXm/8LwoDEq6yb/f2bcBeDyw2E8cAk9exMLPMf//6Nf7UW2bq0lew8/Rr2LrHIwrB8SIciVDuF1dEBSIhDGocm54hWq2NPZIRJZl06O3McdFZA5w26E8Pjky8o1gszno8HAXRiK5yBzI+QunMt9I1eSEaBesZOEYe/vHW+S8SMj09y5++8nYeiaBW4Z//+vf86aef//pyV9cdR48c0XYDjiFc2E//zi/zjos6uN6vMx8JEikYrGKreuiKFyEKGwA0m00iEZpBQKNep16tct/mzUvXvfKVb8zlcjeuiQN4tGFg7984uO8A97pV9OSASATT/imkZUNRO9wAItISX4t6rcbmLVtWVsXfls1k/r20tCRYPB6BsHwOM7ER/lcdZVPmXDyUR8IoCKCtNawYIAxb4lQrFTZv3ly59hWveG86nf7z8sqKYHlkAyL45RPpfde3MU4Mg4BGPCIGjB3+1glozHr2wdqwr8a9995becWrXvUR3/d/XalUhIfhwCONbYTjboirKo9PaygQERIxh1qtxh133rkm/vF4PP7j1X7EI+DwFNGHNRQFFdJJD8cIt91++8prXvvaT8a82A+CIIh4ZPAenrxpF3pMC4q2+pFGXHTqIL/77R8WX/+GN3za87wfNMPmI4m3G1iqC6rgqEIUPfRppdL23sOechqFaBgiURMTCn3x6ZlXv+6NH14V/00YhsIT4Gx9RhD9/a9/djNwnu/7hieIVyqVthpjzgWSPD2qwI4LLrhg8frrr+eJcpzj/B/GuWAVwQkXdgAAAABJRU5ErkJggg==";

export default class extends GridComponentEditor() {
  initializeProperties() {
    this.properties.image = { type: "image", target: this.image, attribute: "src" };
    this.properties.imageAlt = { type: "text", target: this.image, attribute: "alt" };
    this.properties.width = { type: "number", target: this, attribute: "imageWidth", optional: true };
    this.properties.height = { type: "number", target: this, attribute: "imageHeight", optional: true };
    super.initializeProperties();
  }

  create() {
    const image = this.document.createElement("img");

    image.src = defaultImage;
    image.onerror = function() {
      image.src = defaultImage;
    };
    this.root.appendChild(image);
    super.create();
  }

  bindElements() {
    this.image = this.root.querySelector("img");
    super.bindElements();
  }

  get imageWidth() {
    return this.root.dataset.width;
  }

  get imageHeight() {
    return this.root.dataset.height;
  }

  set imageWidth(value) {
    this.root.dataset.width = value;
    if (value != null)
      this.image.setAttribute("width", value);
    else
      this.image.removeAttribute("width");
  }

  set imageHeight(value) {
    this.root.dataset.height = value;
    if (value != null)
      this.image.setAttribute("height", value);
    else
      this.image.removeAttribute("height");
  }
}

