// Read the Phantom webpage '#intro' element text using jQuery and "includeJs"

// http://www.juxtapoz.com/news/erotica/look-who-s-coming-to-tea-the-work-of-tina-lugo/

'use strict';
var page = require('webpage').create();
var _ = require('lodash');

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

var url = 'http://phantomjs.org/';

page.open(url, function(status) {
   if (status === "success") {
      console.log('Successfully connected to: ' + url);

      page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
         page.evaluate(function() {
            // console.log("$(\".explanation\").text() -> " + $(".explanation").text());

            var nodeArray = [];

            var root = $('body');

            pushProcessedNode(root, nodeArray);

            // start at root node
            // terminate if no children
            // recurse on all children
            // store node as xpath, color, height, width, border

            /**
             * Recursively processes and flattens the DOM tree.
             *
             * @typedef ProessedNode
             *
             *
             * @param {jQuery Node} node
             * @param {Array.<ProcessedNode>} nodeArray
             */
            function pushProcessedNode(node, nodeArray) {
               console.log('PUSH PROCESSED NODE');
               // extract relevant information:
               // xpath
               // color
               // height, width
               // border
               // tagname
               // classname
               var processedNode = {};

               // Push the node
               nodeArray.push(processedNode);

               console.log(node);

               // Recurse
               if (node.children()) {
                  console.log('ALL CHILDREN');
                  console.log(node.children().html());
                  for (var i = 0; i < node.children().length; i++) {
                     console.log('CHILD '+i);
                     console.log(node.children()[i]);

                     pushProcessedNode($(node.children()[i]), nodeArray);
                  }
               }
            }

            /**
             * Sort an array of processed nodes
             *
             * @param {Array.<ProcessedNode>} nodeArray
             */
            function sortArray(nodeArray) {
               // _.sortBy(users, function(o) { return o.user; });
            }

         });
         phantom.exit(0);
      });
   } else {
      console.error('exit, with errors');
      phantom.exit(1);
   }
});