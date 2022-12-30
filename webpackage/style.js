class Style {
  constructor() {
    this.ready = fetch("/cms/style").then(response => {
      return response.json();
    }).then(json => {
      this.classes = json;
    });
  }

  classesFor(name) {
    if (this.classes[name] == undefined)
      return [];
    return this.classes[name].split(' ');
  }

  apply(name, target) {
    this.classesFor(name).forEach(function(className) {
      if (className) target.classList.add(className);
    });
  }
}

const style = new Style();

export default style;
