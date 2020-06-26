(function() {
  packages = {

    // Lazily construct the package hierarchy from class names.
    root: function(classes) {
      var map = {};

      function find(name, data) {
        var node = map[name], i;
        if (!node) {
          node = data || {name: name, children: []};
          map[name]=node;
          if (name.length) {
            node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
            node.parent.children.push(node);
            node.key = name.substring(i + 1);
          }
        }
        return node;
      }

      classes.forEach(function(d) {
        find(d.name, d);
      });

      return map[""];
    },

    // Return a list of imports for the given array of nodes.
    imports: function(nodes) {
      var map = {},
          imports = [];

      // Compute a map from name to node.
      nodes.forEach(function(d) {
        map[d.name] = d;
      });

      // For each import, construct a link from the source to target node.
      nodes.forEach(function(d) {
        if (d.imports) d.imports.forEach(function(i) {
          imports.push({source: map[d.name], target: map[i]});
        });
      });

      return imports;
    },
    
    createERgraph: function() {
      var nr=20;
      var prob=0.1;
      var nodes=[];
      var nr=nodes.length;
      for(i=1;i<nr+1;i++){
         var node={}
         node.name=""+i;
         nodes[i]=node;
      }
      
     for(i=1;i<nr+1;i++){
         nodes[i].imports=[];
         for(j=1;j<nr+1;j++){
            if(Math.random() < prob){
                var key2 =""+i;
                nodes[i].imports.push(key2);
            }
         }
     }
      return nodes;
    },
    
 
  };
})();
