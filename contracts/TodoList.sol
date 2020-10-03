pragma solidity ^0.6.0;

contract TodoList {
    uint256 public taskCount = 0;

    struct Task {
        uint256 id;
        string content;
        bool completed;
    }

    mapping (uint => Task) public tasks;

    event TaskCreated (
        uint256 id,
        string content,
        bool completed
    );

    event TaskCompleted (
        uint256 id,
        bool completed
    );


    constructor() public {
        createTask("This is a sample task");
    }

    function createTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task({
            id: taskCount,
            content: _content,
            completed: false
        });
        
        emit TaskCreated(taskCount, _content, false);
    }
    
    function toggleCompleted(uint256 _id) public {
        Task memory _task = tasks[_id];
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        
        emit TaskCompleted(_id, _task.completed);
    }
}