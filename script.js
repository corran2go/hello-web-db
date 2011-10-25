var webDB = {};
webDB.db = null;

webDB.open = function() {
  var dbSize = 5 * 1024 * 1024; // 5MB
  webDB.db = openDatabase('Todo', '1.0', 'todo manager', dbSize);
};

webDB.onError = function(tx, err) {
  console.log('ERROR ' + err.code + ': ' + err.message);
};

webDB.onSuccess = function(tx, rs) {
  webDB.getAllTodoItems(webDB.loadTodoItems);
};

webDB.createTable = function() {
  webDB.db.transaction(function(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS ' +
                  'todo(ID INTEGER PRIMARY KEY, todo TEXT, created DATETIME)', []);
  });
};

webDB.insertTodo = function(todoText) {
  webDB.db.transaction(function(tx) {
    var created = new Date();
    tx.executeSql('INSERT INTO todo(todo, created) VALUES (?,?)',
                  [todoText, created], webDB.onSuccess, webDB.onError);
  });
};

webDB.getAllTodoItems = function(renderFunc) {
  webDB.db.transaction(function(tx) {
    tx.executeSql('SELECT * FROM todo', [], renderFunc, webDB.onError);
  });
};

webDB.loadTodoItems = function(tx, rs) {
  var rowOutput = '';
  for (var i=0; i < rs.rows.length; i++) {
    rowOutput += webDB.renderTodo(rs.rows.item(i));
  }
  var todoItems = document.getElementById('todoItems');
  todoItems.innerHTML = rowOutput;
};

webDB.renderTodo = function(row) {
  return '<li>' + row.ID + ' - ' + row.todo +
         ' [ <a onclick="webDB.deleteTodo(' + row.ID + ');">X</a> ]</li>';
};

webDB.deleteTodo = function(id) {
  webDB.db.transaction(function(tx) {
    tx.executeSql('DELETE FROM todo WHERE ID=?', [id],
                  webDB.onSuccess, webDB.onError);
  });
};

webDB.addTodo = function() {
  var todo = document.getElementById('todo');
  webDB.insertTodo(todo.value);
  todo.value = '';
};

webDB.init = function() {
  webDB.open();
  webDB.createTable();
  webDB.getAllTodoItems(webDB.loadTodoItems);
};
