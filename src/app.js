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
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider || "http://localhost:8545");
        } else {
            alert("Please connect to Metamask.")
        }

        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            try {
                // Request account access if needed
                await ethereum.enable();

            } catch (error) {
                // User denied account access...
                alert('User denied account access!');
            }
        }

        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
        }

        // Non-dapp browsers...
        else {
            alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async () => {
        // destructure the account
        [App.account] = await web3.eth.getAccounts();
    },

    loadContract: async () => {
        // create instance of contract
        App.todoList = await new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        console.log(App.todoList)
    },

    render: async () => {

        // Prevent double render
        if (App.loading) {
            return
        }

        // Update app loading state
        App.setLoading(true);

        // Render Account
        $('#account').html(App.account);

        // Render Tasks
        await App.renderTasks();

        // Update loading state
        App.setLoading(false);
    },

    renderTasks: async () => {
        // Load the total task count from the blockchain
        const taskCount = await App.todoList.methods.taskCount().call();
        const $taskTemplate = $('.taskTemplate');

        // Render out each task with a new task template 
        for (var i = 1; i <= taskCount; i++) {

            // fetch the task data from the blockchain
            const task = await App.todoList.methods.tasks(i).call();
            // const { id, content, completed } = task;
            const taskId = +task[0];
            const taskContent = task[1];
            const taskCompleted = task[2];

            // Create the html for the task
            const $newTaskTemplate = $taskTemplate.clone();
            $newTaskTemplate.find('.content').html(taskContent);
            $newTaskTemplate
                .find('input')
                .prop('name', taskId)
                .prop('checked', taskCompleted)
               .on('click', App.toggleCompleted) 

            // Put the task in the correct list
            if (taskCompleted) {
                $('#completedTaskList').append($newTaskTemplate);
            } else {
                $('#taskList').append($newTaskTemplate);
            }

            // Show the task
            $newTaskTemplate.show()
        }
    },

    createTask: async () => {
        
        App.setLoading(true);
        const content = $('#newTask').val();
        await App.todoList.methods.createTask(content).send({ from: App.account });
        window.location.reload();
    },

    toggleCompleted: async (e) => {

        App.setLoading(true);
        const TaskId = e.target.name;
        await App.todoList.methods.toggleCompleted(TaskId).send({ from: App.account });
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
    }


}

window.addEventListener("load", () => {
    App.load();
});