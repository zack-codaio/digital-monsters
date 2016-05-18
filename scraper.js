// Read the Phantom webpage '#intro' element text using jQuery and "includeJs"

// http://www.juxtapoz.com/news/erotica/look-who-s-coming-to-tea-the-work-of-tina-lugo/

'use strict';
var page = require('webpage').create();
var _ = require('lodash'); // XXX - don't know how to inject in using injectJS
var $ = require('jQuery');

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
            console.log(nodeArray);

            // XXX - lodash doesn't work, need to figure out how to use includeJs
            // _.each(nodeArray, (node) => {
            //    console.log(node.backgroundColor);
            // });

            weightSize(nodeArray, .5);

            for (var i = 0; i < nodeArray.length; i++) {
               console.log('Node', i);
               console.log(nodeArray[i].backgroundColor);
               console.log(nodeArray[i].sizeWeight);
               console.log();
            }

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
               // console.log('PUSH PROCESSED NODE');
               var processedNode = {};

               // extract relevant information:
               // xpath

               // color
               processedNode.backgroundColor = node.css('background');

               // height, width
               processedNode.width = node.width();
               processedNode.height = node.height();


               // border
               // tagname
               // classname


               // Push the node
               nodeArray.push(processedNode);

               // console.log(node);

               // Recurse
               if (node.children()) {
                  // console.log('ALL CHILDREN');
                  // console.log(node.children().html());
                  for (var i = 0; i < node.children().length; i++) {
                     // console.log('CHILD '+i);
                     // console.log(node.children()[i]);

                     pushProcessedNode($(node.children()[i]), nodeArray);
                  }
               }
            }

            /**
             * Generate an XPath for a node by concatenating its selector to its
             * parent's XPath.
             *
             * @param {ProcessedNode} parent
             * @param {jQuery Node} node
             * @returns {string}
             */
            function generateXPath(parent, node) {

            }

            /**
             * Run a tf/idf filter on a node array. Is it possible to use color
             * distance in addition to strict modality?
             *
             * XXX - would ideally want to look for img / video, other indicators
             *    of visual interest.
             *
             * @param {Array.<ProcessedNode>}
             * @returns {Array.<ProcessedNode>}
             */
            function weightColor(nodeArray) {
               // for each node
               // get color
               // compare to "document color," however that might be defined
               // assign colorWeight to the node
            }

            /**
             * Assigns an interest based on the dimensions of each node.
             *
             * Might be an interesting candidate for a genetic algorithm.
             * Might be intersting to compare to sibling nodes.
             *
             * @param {Array.<ProcessedNode>}
             * @param {number} percentile 0-1 target for size.
             * @returns {Array.<ProcessedNode>}
             */
            function weightSize(nodeArray, percentile) {
               // Calculate size
               for (var i = 0; i < nodeArray.length; i++) {
                  var node = nodeArray[i];
                  var width = node.width;
                  var height = node.height;

                  // XXX - naive
                  node.sizeWeight = width * height;
               }

               // Order by size
               // _.sortBy(nodeArray, (node) => {
               //    return node.sizeWeight;
               // });

               // Normalize
               var targetIndex = Math.floor(nodeArray.length * percentile);

               for (var i = 0; i < nodeArray.length; i++) {
                  var node = nodeArray[i];
                  var targetDistance = Math.abs(targetIndex - i);
                  node.sizeWeight = node.sizeWeight * (targetDistance ^ 2);
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