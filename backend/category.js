const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

class Category {
  constructor(file, file_base_name, ver) {
    this.file = file;
    this.file_base_name = file_base_name;
    this.ver = ver;
  }

  load() {
    this.data = JSON.parse(fs.readFileSync(this.file));
  }

  getName() {
    return this.data.name;
  }

  getAnswer(points, index) {
    return this.data.levels?.[points]?.[index];
  }

  addAnswer(points, answer) {
    const level = this.data.levels?.[points];

    if (level == undefined) {
      this.data.levels[points] = [];
    }

    this.data.levels[points].push(answer);

    return {
      category: this.data.name,
      points,
      index: this.data.levels[points].length - 1,
    };
  }

  editAnswer(points, index, answer) {
    const level = this.data.levels?.[points]?.[index];

    if (level == undefined) {
      return false;
    }

    this.data.levels[points][index] = answer;

    return true;
  }

  deleteAnswer(points, index) {
    if (this.data.levels?.[points]?.[index] == undefined) {
      return false;
    }

    this.data.levels[points].splice(index, 1);

    if (this.data.levels[points].length == 0) {
      delete this.data.levels[points];
    }

    return true;
  }

  save() {
    fs.writeFileSync(
      path.join(
        path.dirname(this.file),
        `${this.file_base_name}.${++this.ver}.json`
      ),
      JSON.stringify(this.data, null, 4)
    );
  }

  selectRandomAnswersPerLevel() {
    let copy_data = JSON.parse(JSON.stringify(this.data));
    const answerArray = [];
    for (let level in copy_data.levels) {
      let answers = copy_data.levels[level];
      answerArray.push({
        ...answers[Math.floor(answers.length * Math.random())],
        points: parseInt(level),
        id: uuidv4(),
        finished: false
      });
    }
    return answerArray;
  }
}

module.exports = Category;
