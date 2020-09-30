const { v4: uuidv4 } = require("uuid");

class Player {
  constructor(name) {
    this.name = name;
    this.uuid = uuidv4();
    this.points = 0;
    this.rejected = [];
    this.accapted = [];
  }

  // addAccacptedQuestion(answer_id, points) {
  //   this.accapted.accapted.push({
  //     answer_id,
  //     points,
  //   });
  //   this.points += points;
  // }

  // addRejectedQuestion(answer_id) {
  //   this.rejected.push(answer_id);
  // }
}

module.exports = Player;
