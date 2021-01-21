App = {
	loading: false,
	contracts: {},
	load: async () => {
		await App.loadWeb3();
		await App.loadAccount();
		await App.loadContract();
		await App.render();
	},
	loadWeb3: async () => {
		if (typeof web3 !== 'undefined') {
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);
		} else {
			window.alert('Please connect to Metamask.');
		}
		// Modern dapp browsers...
		if (window.ethereum) {
			window.web3 = new Web3(ethereum);
			try {
				// Request account access if needed
				await ethereum.enable();
				// Acccounts now exposed
				web3.eth.sendTransaction({
					/* ... */
				});
			} catch (error) {
				// User denied account access...
			}
		}
		// Legacy dapp browsers...
		else if (window.web3) {
			App.web3Provider = web3.currentProvider;
			window.web3 = new Web3(web3.currentProvider);
			// Acccounts always exposed
			web3.eth.sendTransaction({
				/* ... */
			});
		}
		// Non-dapp browsers...
		else {
			console.log(
				'Non-Ethereum browser detected. You should consider trying MetaMask!'
			);
		}
	},
	loadAccount: async () => {
		App.account = web3.eth.accounts[0];
	},
	loadContract: async () => {
		//Create a JS version of the smart contract
		const Etherente = await $.getJSON('Etherente.json'); //bs-config file points to the directory
		App.contracts.Etherente = TruffleContract(Etherente);
		App.contracts.Etherente.setProvider(App.web3Provider);

		//Hydrate the smart contract with values from the blockchain
		App.Etherente = await App.contracts.Etherente.deployed();
	},
	render: async () => {
		//prevent double render
		if (App.loading) {
			return;
		}
		//update App loading state
		App.setLoading(true);
		//render account
		$('#account').html(App.account);
		//render transfers
		await App.renderDeposits();
		//update loading state
		App.setLoading(false);
	},
	renderDeposits: async () => {
		//load the total tasks count from the blockchain---------
		const depositCount = await App.Etherente.depositCount();
		const $taskTemplate = $('.taskTemplate');

		//render out each task with a next task template----------
		for (let index = 1; index <= depositCount; index++) {
			//fetch the task data from the blockchain
			const deposit = await App.Etherente.balances(index);
			const depositDate = new Date(deposit[0] * 1000); //task Id
			const depositAddress = deposit[1]; //task content
			let depositValue = deposit[2]; //task completed
			//Create the html for the task
			depositValue =
				Math.round(Number(depositValue.toString()) / 10000000000000000) / 100;
			const $newTaskTemplate = $taskTemplate.clone();
			$newTaskTemplate.find('.content').html(depositValue);
			$newTaskTemplate.find('.content-address').html(depositAddress);
			$newTaskTemplate.find('.content-date').html(depositDate);
			//$newTaskTemplate.find('input').prop('name', index).prop('checked', false);
			//.on('click', App.toggleCompleted);

			//put the task in the correct list
			// if (taskCompleted) {
			// 	$('#completedTaskList').append($newTaskTemplate);
			// } else {
			// 	$('#taskList').append($newTaskTemplate);
			// }
			$('#taskList').append($newTaskTemplate);
			//show the task
			$newTaskTemplate.show();
		}

		//render the balance of the contract----------------------
		const $headTemplate = $('.headTemplate');
		const $SumTemplate = $headTemplate.clone();
		let balance = await App.Etherente.balanceSum();
		balance = Math.round(Number(balance.toString()) / 10000000000000000) / 100;
		$SumTemplate
			.find('.content')
			.html(balance + ' Eth  (' + balance * 973 + '€)');
		$SumTemplate.find('.content-address').html('TOTAL BALANCE');
		$SumTemplate.find('.content-date').html(new Date());
		$('#taskList').append($SumTemplate);
		$SumTemplate.show();
	},
	createTask: async () => {
		App.setLoading(true);
		const content = $('#newTask').val() * 1000000000000000;
		await App.Etherente.invest({ value: content });
		window.location.reload();
	},
	setLoading: (boolean) => {
		App.loading = boolean;
		const loader = $('#loader');
		const content = $('#content');
		if (boolean) {
			loader.show();
			content.hide();
		} else {
			loader.hide();
			content.show();
		}
	},
};
$(() => {
	$(window).load(() => {
		App.load();
	});
});
