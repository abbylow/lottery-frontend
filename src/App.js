import React from "react";
import "./App.css";
import web3 from './web3';
import lottery from "./lottery";

class App extends React.Component {
  state = { 
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: '',
    lastWinner: '',
    isManager: false,
  };

  async componentDidMount() {
    // dont have to specify "from" field when using metamask provider
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    const accounts = await web3.eth.getAccounts();

    this.setState({ 
      manager,
      players,
      balance,
      isManager: manager === accounts[0]
    });
  }

  onSubmit = async(e) => {
    e.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on transaction success...' });
    
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    this.setState({ message: 'You have been entered! ' });
  }

  onClick = async() => {
    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on transaction success...' });
    
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    const lastWinner = await lottery.methods.lastWinner().call();

    this.setState({ message: `The winner is ${lastWinner}` });
  }

  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>
          This contract is managed by {this.state.manager}.
          There are currently {this.state.players.length} people entered, 
          competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether! 
        </p>

        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck? </h4>
          <div>
            <label>Amount of ether to enter</label>
            <input
              value={this.state.value}
              onChange={e => this.setState({ value: e.target.value })}
            />
          </div>
          <button>
            Enter
          </button>
        </form>

        <hr />
        {
          this.state.isManager && (
            <>
              <h4>Ready to pick a winner? </h4>
              <button onClick={this.onClick}>Pick a winner!</button>
              <hr />
            </>
          )
        }

        <h1>{this.state.message}</h1>

      </div>
    );
  }
}
export default App;
