$(function(){ 
  var TestDB;
  var currentID=0;
  initDatabase();
  
  updateRestore();
  
 	// Button and link actions
	$('#btnSave').click(function(){ saveCurrent(); return false;});
	$('#btnDel').click(function(){ delCurrent(); return false;});
 	$('#restore').change(function(){restoreTo($(this).find('option:selected').val()); });

  
  function initDatabase() {
    try {
        if (!window.openDatabase) {
            alert('Local Databases are not supported by your browser. Please use a Webkit browser for this demo');
        } else {
            var shortName = 'TestDB';
            var version = '1.0';
            var displayName = 'TestDB';
            var maxSize = 100000; // in bytes
            TestDB = openDatabase(shortName, version, displayName, maxSize);
            createTables();
            updateRestore();
        }
    } catch(e) {
        if (e == 2) {
            // Version mismatch.
            console.log("Invalid database version.");
        } else {
            console.log("Unknown error "+ e +".");
        }
        return;
    } 
  }
  
  function updateRestore(){
    TestDB.transaction(
          function (transaction) {
            transaction.executeSql("SELECT id FROM codeFarm;", [], function(transaction, results){
                  $('#restore option').remove();
                    $('#restore').append('<option value="0">New</option>');
                  for (var i=0; i<results.rows.length; i++) {
                    var row = results.rows.item(i);
                    id = row.id;
                    if(id==currentID){
                      $('#restore').append('<option value="'+id+'" selected>'+id+'</option>');
                    }else{
                      $('#restore').append('<option value="'+id+'">'+id+'</option>');
                    }
                  }
              });
          }
      );
  }
  
  function restoreTo(id){
    if(id==0){
      $('#editor').val('');
      currentID=0;
      console.log('restore to 0');
    }else{
      TestDB.transaction(
          function (transaction) {
            transaction.executeSql("SELECT code FROM codeFarm where id = ?;", [id], function(transaction, results){
              var row = results.rows.item(0);
              var code = row.code;
              $('#editor').val(code);
              currentID=id;
              console.log('restore to '+id+' with '+code);
            });
          }
      );
    }
  }
  
  function createTables(){
    TestDB.transaction(
          function (transaction) {
            transaction.executeSql(
            'CREATE TABLE IF NOT EXISTS codeFarm('+
              'id INTEGER NOT NULL PRIMARY KEY, '+
              'code TEXT NOT NULL'+
            ');', [], function(){
              console.log("done.");
            }, function(){
              console.log("query count errot.");
            });
          }
      );
  }
  
  function saveCurrent(){
    TestDB.transaction(
        function (transaction) {
          var code = $('#editor').val();
          
          console.log('about to save to:'+currentID+' with '+code);
          if(currentID==0){
            var newid=1;
            transaction.executeSql("SELECT MAX(*) as idcount FROM codeFarm;", [], function(transaction, results){
              var row = results.rows.item(0);
              if(row!=null){
                newid = parseInt(row.idcount)+1;
                console.log("id:"+newid+', count:'+row.idcount);
              }else{
                console.log("query crash.");
                return false;
              }
                
              transaction.executeSql("INSERT INTO codeFarm(id, code) VALUES (?, ?)", [newid,code]);
              currentID = newid;
              updateRestore();
            }, function(){
                console.log("query count errot.");
            });
                      
          }else{                      
            console.log('update:'+currentID+' with '+code);
            transaction.executeSql("UPDATE codeFarm SET code = ? WHERE id = ?", [code, currentID]);
          }
        }
    );
  }
  function delCurrent(){
    TestDB.transaction(
      function (transaction) {
        if(currentID!=0){
          transaction.executeSql("Delete from codeFarm where id = ?", [currentID]);
          currentID=0;
          $('#editor').val('');
          updateRestore();
        }else{
          $('#editor').val('');
        }
    });
  }
});