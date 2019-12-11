const express = require('express');
var fs = require('fs');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
var request = require('request');

var pokeapi = "https://pokeapi.co/api/v2/pokemon/"

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public'));

// connect to the database
mongoose.connect('mongodb://localhost:27017/pokemon', {
  useNewUrlParser: true
});

// create schema for a pokemon team
const teamSchema = new mongoose.Schema({
  name:String,
  pokemon: [],
});

// create a model for teams in the db
const Team = mongoose.model('Team', teamSchema);

// post a new team to the server
app.post('/api/teams', async (req, res) =>{
  const team = new Team({
    name: req.body.name,
    pokemon: req.body.pokemon,
  });
  console.log("In post");
  try {
    await team.save();
    res.send(team);
  } catch(error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// get all the saved teams
app.get('/api/teams', async (req, res) => {
  console.log("In get teams");
  try {
    let teams = await Team.find();
    res.send(teams);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.get('/', function(req, res, next) {
  res.sendFile('index.html', { root: 'public' });
});


app.get('/pokeapi', function(req, res, next) {
    console.log("in pokeapi");
    console.log("URL " + pokeapi+req.query.q);
    request(pokeapi+req.query.q).pipe(res);
});

app.put('/api/teams/:id', async (req, res) => {
  console.log("In put");
  try {
    console.log("In Put " + req.params.id);
    let team = await Team.findOne({_id:req.params.id});
    team.name = req.body.name;
    team.pokemon = req.body.pokemon;
    team.save();
    res.send(team);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  try {
    console.log("In New Delete " + req.params.id);
    let teams = await Team.deleteOne({_id:req.params.id});
    res.send(teams);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.listen(4202, () => console.log('Server listening on port 4202!'));