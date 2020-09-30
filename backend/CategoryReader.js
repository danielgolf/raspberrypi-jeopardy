const fs = require("fs");
const Category = require("./category.js");
const path = require("path");
const autoBind = require("auto-bind");
const fileExtension = ".json";

class CategoryReader {
  constructor(path) {
    this.path = path;
    this.categories = [];
    this.categories_map = {};

    autoBind(this);
  }

  loadAll() {
    const files = fs.readdirSync(this.path);
    const newest_files = {};

    files.forEach((file) => {
      if (path.extname(file) == fileExtension) {
        const basename = path.basename(file, fileExtension);
        let ver = path.extname(basename);
        const name = path.basename(basename, ver);

        ver = ver.substring(1);

        if (isNaN(ver)) {
          return;
        } else {
          ver = parseInt(ver);
        }

        if (name in newest_files) {
          if (ver > newest_files[name].ver) {
            newest_files[name].ver = ver;
            newest_files[name].file = file;
          }
        } else {
          newest_files[name] = {
            ver,
            file,
            name,
          };
        }
      }
    });

    for (let c in newest_files) {
      c = newest_files[c];
      const category = new Category(
        path.join(this.path, c.file),
        c.name,
        c.ver
      );
      category.load();
      this.categories.push(category);
      this.categories_map[category.getName()] = category;
    }
  }

  getCategoryNames() {
    return this.categories.map(c => c.getName());
  }

  getCategoryData() {
    return this.categories.map(c => c.data);
  }

  getCategoryByName(name) {
    return this.categories_map[name];
  }
}

module.exports = CategoryReader;
