var c = document.getElementsByTagName('canvas')[0];
var ctx = c.getContext("2d");
var w = 700;
var h = 700;
var ROWS = 25;
var COLS = 25;
var BLOCK_W = Math.floor(w/ COLS);
var BLOCK_H = Math.floor(h / ROWS);
var gameOver = false;

var size = ROWS;
  
var grid_aStar = grid(size);
  
var start_x = Math.floor(ROWS/2);
var start_y = Math.floor(COLS/2);

do {
  var item_x = Math.floor(Math.random() * size);
  var item_y = Math.floor(Math.random() * size);
} while (grid_aStar[item_y][item_x].block == true)


var snake = new Array();
snake.push(grid_aStar[start_y][start_x]);
grid_aStar[start_y][start_x].block = true;

function Node(x, y) {
    this.block = false;
    this.x = x;  
    this.y = y;
    this.parent = null;
    this.gScore = -1; 
    this.fScore = -1; 
    this.heuristicCalc = function (x_final, y_final) {
        return Math.floor(Math.abs(x_final - this.x) + Math.abs(y_final - this.y));
    };
}

function grid(size) {
  
  var grid = new Array(size);
  for (var i = 0; i < size; i++) {
    grid[i] = new Array(size);
  }
  
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      if(grid[i][j] != "-") {
        grid[i][j] = new Node(j, i);
      }
    }
  }
  
  return grid;
}

function fScoreSort(a,b) {
  if (a.fScore < b.fScore)
    return -1;
  if (a.fScore > b.fScore)
    return 1;
  return 0;
}

function inBoundsCheck(currentNode, i, j) {
    if (((currentNode.x + j) < 0) || ((currentNode.x + j) > size - 1) || ((currentNode.y + i) < 0) || ((currentNode.y + i) > size - 1)) {
        return false;
    }

    if ((grid_aStar[currentNode.y + i][currentNode.x + j].block)) {
        return false;
    }

    if ((currentNode.y + i == currentNode.y && currentNode.x + j == currentNode.x)
        || ((i == -1) && (j == -1)) || ((i == -1) && (j == 1))
        || ((i == 1) && (j == -1)) || ((i == 1) && (j == 1))) {
        return false;
    }

    return true;
}


function A_Star() {
  
  var end_x = item_x;
  var end_y = item_y;
  
  var closedSet = [];
  
  var openSet = [];

  openSet.push(grid_aStar[start_y][start_x]);
  grid_aStar[start_y][start_x].gScore = 0;
  grid_aStar[start_y][start_x].fScore = grid_aStar[start_y][start_x].heuristicCalc(end_x, end_y); 

  while (openSet.length > 0) {
    openSet.sort(fScoreSort);
    var currentNode = openSet[0];
    
    if ((currentNode.x == end_x) && (currentNode.y == end_y)) {
      return reconstruct_path(grid_aStar, currentNode, start_x, start_y); 
    }
    
    var index = openSet.indexOf(currentNode);
    openSet.splice(index, 1);
    
    closedSet.push(currentNode);
    
    for (var i = -1; i < 2; i++) {
      for (var j = -1; j < 2; j++) {

        if (!inBoundsCheck(currentNode, i, j)) {
            continue;
        }

        var neighbour = grid_aStar[currentNode.y + i][currentNode.x + j];
        
        if (closedSet.indexOf(neighbour) != -1) {
          continue;
        }
        
        var tScore = neighbour.gScore + 1;
        
        if (openSet.indexOf(neighbour) == -1) {
          openSet.push(neighbour);
        }
        
        neighbour.parent = currentNode;
        neighbour.gScore = tScore;
        neighbour.fScore = neighbour.gScore + neighbour.heuristicCalc(end_x, end_y);
        
      }
    }
  }
  
  return false;
  
}

function reconstruct_path(grid_aStar, current, start_x, start_y) {
    var currentNode = current;
    var totalPath = [current];
    
    while (currentNode.parent != null) {
      totalPath.push(currentNode.parent);
      currentNode = currentNode.parent;
    }
    
    return totalPath;
}

function draw() {
    if (!gameOver) {
        for (var x = 0; x < COLS; ++x) {
            for (var y = 0; y < ROWS; ++y) {

                if (((y == item_y) && (x == item_x))) {
                    ctx.fillStyle = "red";
                } else if (grid_aStar[y][x].block) {
                    ctx.fillStyle = "white";
                } else {
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = "0.8";
                    ctx.fillStyle = 'black';
                }
                ctx.fillRect(BLOCK_W * x  , BLOCK_H * y, BLOCK_W , BLOCK_H);
                ctx.strokeRect(BLOCK_W * x , BLOCK_H * y, BLOCK_W, BLOCK_H);
            }
        }
    }
}

function getNextMove(end_x, end_y) {
    var nextLoc;
    var lowestfScore = -1;
    var lowestfScoreNode = null;
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {

            if (!inBoundsCheck(snake[0], i, j)) {
                continue;
            }

            var neighbour = grid_aStar[snake[0].y + i][snake[0].x + j];

            var pathScore = neighbour.gScore + neighbour.heuristicCalc(end_x, end_y) + pathLength(neighbour) + 1;

            if (pathScore > lowestfScore) {
                lowestfScore = pathScore;
                lowestfScoreNode = neighbour;
            }
        }
    }

    return lowestfScoreNode;
}

function pathLength(currentNode) {

    var currNode = currentNode;
    var numOfNodes = 0;

    var longestPathArray = new Array();

    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
        
            if (!inBoundsCheck(currNode, i, j)) {
                continue;
            }

            currNode = grid_aStar[currNode.y + i][currNode.x + j];

            numOfNodes++;
            i = -1;
            j = -1;

            longestPathArray.push(currNode);
            
            if ((!((currNode.x + 1) >= 0 && (currNode.x + 1) < size) || grid_aStar[currNode.y][currNode.x + 1] == undefined || grid_aStar[currNode.y][currNode.x + 1].block)
                && (!((currNode.x - 1) >= 0 && (currNode.x - 1) < size) || grid_aStar[currNode.y][currNode.x - 1] == undefined || grid_aStar[currNode.y][currNode.x - 1].block)
                && (!((currNode.y + 1) >= 0 && (currNode.y + 1) < size) || grid_aStar[currNode.y + 1][currNode.x] == undefined || grid_aStar[currNode.y + 1][currNode.x].block)
                && (!((currNode.y - 1) >= 0 && (currNode.y - 1) < size) || grid_aStar[currNode.y - 1][currNode.x] == undefined || grid_aStar[currNode.y - 1][currNode.x].block)) {

                for (var i = 0; i < longestPathArray.length - 1; i++) {
                    longestPathArray[i].block = false;
                }

                return numOfNodes;
            }
            currNode.block = true;
        }
    }
}


function tick() {

    var tail;

    if (!gameOver) {

        var path = A_Star();

        for (var j = 0; j < path.length - 1; j++) {
            path[j].parent = null;
            path[j].gScore = -1;
            path[j].fScore = -1;
        }

        for (var i = 0; i < grid_aStar.length; i++) {
            for (var j = 0; j < grid_aStar.length; j++) {
                grid_aStar[i][j].parent = null;
                grid_aStar[i][j].gScore = -1;
                grid_aStar[i][j].fScore = -1;

            }
        }

        if (path) {
            var nextLoc = path[path.length - 2];
        } else { 
            var nextNode = getNextMove(item_x, item_y);
            if (nextNode == null) {
                gameOver = true;
                document.getElementById('gameover').innerHTML = "Game Over";
                return;
            } else {
                nextLoc = nextNode;
            }
        }

        snake.unshift(nextLoc) 
        nextLoc.block = true;
        start_x = nextLoc.x;
        start_y = nextLoc.y;

        if (!((nextLoc.x == item_x) && (nextLoc.y == item_y))) {
            tail = snake.pop();
            tail.block = false;
            tail.gScore = -1;
            tail.fScore = -1;
        } else {
            do {
                item_x = Math.floor(Math.random() * ROWS);
                item_y = Math.floor(Math.random() * ROWS);
            } while (grid_aStar[item_y][item_x].block == true)
        }
    }
}


function startGame() {

    draw();

    setInterval( tick, 50 );
    setInterval( draw, 50 );

}

startGame();
