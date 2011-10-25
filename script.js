var webdb = {};
webdb.db = null;

webdb.open = function() {
  var dbSize = 5 * 1024 * 1024; // 5MB
  webdb.db = openDatabase('Todo', '1.0', 'todo manager', dbSize);
};

webdb.onError = function(tx, err) {
  console.log('ERROR ' + err.code + ': ' + err.message);
};

webdb.onSuccess = function(tx, rs) {
  console.log('SUCCESS ' + rs);
  webdb.getAllTodoItems(webdb.loadTodoItems);
};

webdb.createTable = function() {
  webdb.db.transaction(function(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS ' +
                  'todo(ID INTEGER PRIMARY KEY, todo TEXT, created DATETIME)', []);
  });
};

webdb.insertTodo = function(todoText) {
  webdb.db.transaction(function(tx) {
    var created = new Date();
    tx.executeSql('INSERT INTO todo(todo, created) VALUES (?,?)',
                  [todoText, created], webdb.onSuccess, webdb.onError);
  });
};

webdb.getAllTodoItems = function(renderFunc) {
  webdb.db.transaction(function(tx) {
    tx.executeSql('SELECT * FROM todo', [], renderFunc, webdb.onError);
  });
};

webdb.loadTodoItems = function(tx, rs) {
  var rowOutput = '';
  for (var i=0; i < rs.rows.length; i++) {
    rowOutput += webdb.renderTodo(rs.rows.item(i));
  }
  var todoItems = document.getElementById('todoItems');
  todoItems.innerHtml = rowOutput;
};

webdb.renderTodo = function(row) {
  return '<li>' + row.ID +
         '[<a onclick="webdb.deleteTodo(' + row.ID + ');">X</a>]</li>';
};

webdb.deleteTodo = function(id) {
  webdb.db.transaction(function(tx) {
    tx.executeSql('DELETE FROM todo WHERE ID=?', [id],
                  webdb.onSuccess, webdb.onError);
  });
};

webdb.addTodo = function() {
  var todo = document.getElementById('todo');
  webdb.insertTodo(todo.value);
  todo.value = '';
};

webdb.init = function() {
  webdb.open();
  webdb.createTable();
  webdb.getAllTodoItems(webdb.loadTodoItems);
};
