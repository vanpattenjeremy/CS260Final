var app = new Vue({
    el: '#app',
    data: {
        fullTeam: false,
        pokeName: '',
        pokemon: [],
        searchName: '',
        teams: [],
        foundTeam: null,
        currTeam: [],
        teamName: '',
        showSave: false,
        showSaveButton: false,
    },
    created() {
        this.getTeams();
    },
    methods: {
        addPokemon() {
            console.log("In get Pokemon " + this.pokemon);
            var url = "http://jeremyvanpatten.com:4202/pokeapi?q=" + this.pokeName.toLowerCase();
            console.log("URL" + url);
            fetch(url)
            .then((data) => {
                return (data.json());
            })
            .then((pokeData) => {
                this.pokemon = [];
                this.pokeName = '';
                var types = [];
                for(var i = 0; i < pokeData.types.length; i++) {
                    types.push(pokeData.types[i].type.name)
                }
                this.pokemon = {
                    name: pokeData.name,
                    types: types,
                    sprite: pokeData.sprites.front_default
                };
                console.log("Got " + this.pokemon.name)
                if(this.currTeam.length >= 6) {
                    this.fullTeam = true;
                }
                else {
                    this.currTeam.push(this.pokemon);
                    this.fullTeam = false;
                }
                for(var i = 0; i < this.currTeam.length; i++) {
                    console.log(this.currTeam[i].name)
                }
            });
            
        },
        removePokemon(pokemon) {
            console.log("in remove pokemon " + pokemon);
            for(var i = 0; i < this.currTeam.length; i++) {
                if(this.currTeam[i].name == pokemon) {
                    this.currTeam.splice(i,1);
                    i = this.currTeam.length;
                }
            }
        },
        async getTeams() {
            try {
                let response = await axios.get('/api/teams');
                this.teams = response.data;
                return true;
            } catch (error) {
                console.log(error);
            }
        },
        async loadTeam(team) {
            this.searchName = '';
            this.foundTeam = team;
            this.teamName = team.name
            this.currTeam = [];
            console.log(team.pokemon.length);
            for(var i = 0; i < team.pokemon.length; i++) {
                this.currTeam.push(team.pokemon[i]);
            }
            console.log(this.currTeam);
        },
        async saveTeam() {
            if(this.foundTeam === null)
            {
                console.log(this.currTeam.length);
                try {
                    let response = await axios.post('/api/teams', {
                        name: this.teamName,
                        pokemon: this.currTeam,
                    });
                    this.foundTeam = response;
                } catch(error) {
                    console.log(error);
                }
            }
            else {
                try {
                    let response = await axios.put('/api/teams/' + this.foundTeam._id, {
                        name: this.teamName,
                        pokemon: this.currTeam,
                    });
                    this.foundTeam = response;
                } catch(error) {
                    console.log(error);
                }
            }
            this.getTeams();
        },
        async deleteTeam() {
            try {
                let response = axios.delete('/api/teams/' + this.foundTeam._id);
                this.foundTeam = null;
                this.currTeam = [];
                this.teamName = '';
                this.getTeams();
                return true;
          } catch (error) {
                console.log(error);
          }
        },
        closeTooManyPoke() {
            this.fullTeam=false;
        },
        newTeam() {
            this.currTeam = [];
            this.foundTeam = null;
            this.teamName = '';
        }
    },
    watch: {
        currTeam: function() {
            if(this.currTeam.length > 0) {
                this.showSave = true;
            }
            else {
                this.showSave = false;
            }
        },
        teamName: function() {
            if(this.teamName.length > 0) {
                this.showSaveButton = true;
            }
            else {
                this.showSaveButton = false;
            }
        }
        
    },
    computed: {
        suggestions() {
            if(this.searchName.length > 0) {
                return this.teams.filter(team => team.name.toLowerCase().startsWith(this.searchName.toLowerCase()));
            }
            else {
                return [];
            }
        }
    }
});