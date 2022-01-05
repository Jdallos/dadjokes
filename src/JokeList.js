import React, { Component } from 'react';
import Joke from './Joke';
import axios from 'axios';
import './JokeList.css';

const API_url = 'https://icanhazdadjoke.com/';

// Remove button

class JokeList extends Component {
    static defaultProps = {
        numStarterJokes: 10
    }

    constructor(props) {
        super(props);
        this.state = {
            // Contains the data response
            // Getting the info parsed from the local storage or if LS empty, set empty array
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
            loading: false
        };
        // creating set here as doesn't need to be in state, nor does it affect the view, its just keeping track of data internally...
        // created here to also insert into set what is already in jokes/ local storage
        this.seenJokes = new Set(this.state.jokes.map(j => j.id));
        // console.log(this.seenJokes);
        this.updateScore = this.updateScore.bind(this);
        this.getMoreJokes = this.getMoreJokes.bind(this);
    }

    // See the videos for a better way to structure these getJoke functions
    // The video kept setState within getJokes, but I put it here, so need to make this async and await
    async componentDidMount() {
        if (this.state.jokes.length === 0) {
            let starterJokes = await this.getJokes();
            console.log(starterJokes);
            // console.log(starterJokes[[PromiseResult]]);
            this.setState({
                jokes: starterJokes,
                loading: false
            });
            window.localStorage.setItem("jokes", JSON.stringify(starterJokes));
        }
    }

    async getJokes() {
        // To handle API errors
        try {
            let starterJokes = [];
            this.setState({ loading: true });
            while (starterJokes.length < this.props.numStarterJokes) {
                // Note seting a header
                let response = await axios.get(API_url, {
                    headers: { Accept: 'application/json' }
                });
                // console.log(response);
                // console.log(response.data.joke);
                // Could be more selective with what goes in state rather than all data...
                // console.log(response.data.text);
                if (!this.seenJokes.has(response.data.id)) {
                    starterJokes.push({ ...response.data, score: 0 });
                    // Updating the set with added Jokes
                    this.seenJokes.add(response.data.id);
                } else {
                    console.log('Found duplicate');
                    console.log(response.data.joke);
                }
            }
            // console.log(this.seenJokes);
            return starterJokes;
        } catch (e) {
            alert(e);
            this.setState({
                loading: false
            });
        }

    }

    async getMoreJokes() {
        let moreJokes = await this.getJokes();
        // console.log(moreJokes);
        // To handle API errors
        if (moreJokes !== undefined) {
            this.setState((st) => ({
                jokes: [...st.jokes, ...moreJokes],
                loading: false
            }));
            window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes));
        }

    }
    // NOT USING THIS VERSION DUE TO LOCAL STORAGE BUG MISSING FIRST SCORE CHANGE
    // updateScore(id, add) {
    //     const scoresUpdate = this.state.jokes.map((joke) => {
    //         if (joke.id === id) {
    //             // Syntax difficulties
    //             console.log(add);
    //             return (add === true
    //                 // Seems I can't use ++ in this context as didn't work
    //                 // also had a weird console.log++ that fixed it?
    //                 ? { ...joke, score: joke.score + 1 }
    //                 : { ...joke, score: joke.score - 1 })
    //             // console.log('id match');
    //             // console.log(joke.score++);
    //             // return {...joke, score: joke.score+1}
    //         } else {
    //             // console.log('id NOT match');
    //             return joke
    //         }
    //     })
    //     // console.log(scoresUpdate);
    //     this.setState({ jokes: scoresUpdate });
    //     // Bug here, misses the first vote in localStorage but not in state...
    // TRIED NESTING WITHIN SETSTATE STILL DIDN'T WRK
    //     window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes));
    //     console.log(window.localStorage.getItem("jokes"));
    //     // Could also do the above a setState callback and map within
    // }

    // This way fixes the 'number lag' issue with local storage,
    // even though a console.log shows its still one behind...
    updateScore(id, delta) {

        this.setState((st) => ({
            jokes: st.jokes.map(j =>
                j.id === id ? { ...j, score: j.score + delta } : j
            )
        }),
            // another function after setState has run
            () => window.localStorage.setItem("jokes", JSON.stringify
                (this.state.jokes))
        )
        // console.log(window.localStorage.getItem("jokes"));
    }

    makeJokes() {
        // Sorting in this way is too sudden jump of the jokes changing position
        // console.log(this.state.jokes);
        // Example of using the sorting method, check how this works- b-a is big to small, a-b is small to big
        // Creating a new array
        let sortedJokes = [...this.state.jokes].sort((a,b) => b.score - a.score);
        return sortedJokes.map((joke) => (
            <Joke
                joke={joke.joke}
                // Will be uniqie when preventing duplicates
                key={joke.id}
                id={joke.id}
                score={joke.score}
                updateScore={this.updateScore}
            />
        ));
    }
    seperate
    render() {
        if (this.state.loading) {
            return (
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin" />
                    <h1 className="JokeList-title">Loading</h1>
                </div>
            )
        }
        return (
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title">
                        <span>Dad</span> Jokes
                    </h1>
                    <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' alt="smiley face icon" />
                    <button onClick={this.getMoreJokes} className="JokeList-getmore">Fetch Jokes</button>
                </div>
                <div className="JokeList-jokes">
                    {this.makeJokes()}
                </div>
            </div>
        )
    }
}

export default JokeList;