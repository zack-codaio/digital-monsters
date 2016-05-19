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
         console.log('INJECTED JQUERY');
         page.includeJs('http://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.12.0/lodash.min.js', function() {
            console.log('INJECTED LODASH');

            page.onCallback = function(data) {
               console.log('ON CALLBACK');
               if (data.exit) {
                  console.log('RENDERING');
                  page.render('testImage_render.png');
                  phantom.exit();
               }
            }

            page.evaluate(function() {
               console.log('REACHED EVALUATE');

               var nodeArray = [];

               var root = $('body');

               pushProcessedNode(root, nodeArray);

               // Weight
               weightSize(nodeArray, .5);
               weightColor(nodeArray);
               multiplyWeights(nodeArray);

               // sort by weight
               nodeArray = _.sortBy(nodeArray, function(node) {
                  if (node.weight === Infinity) {
                     return 0;
                  }

                  return node.weight;
               });

               // Print results
               _.each(nodeArray, function(node) {
                  // console.log(node.backgroundColor);
                  console.log(node.sizeWeight);
                  console.log(node.colorWeight);
                  console.log(node.weight);
                  console.log(' ');
               });

               // Highlight the top 5 choices
               for (var i = nodeArray.length - 5; i < nodeArray.length; i++) {
                  highlightNode(nodeArray[i]);
               }

               // eventhandler to call render
               window.callPhantom({ exit: true });

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
                  // Push the node
                  var processedNode = processNode(node);
                  nodeArray.push(processedNode);

                  // Recurse
                  if (node.children()) {
                     for (var i = 0; i < node.children().length; i++) {
                        pushProcessedNode($(node.children()[i]), nodeArray);
                     }
                  }
               }

               /**
                * Extract data from the node and store it in a ProcessedNode object.
                *
                * @param {jQuery Node} node
                * @returns {ProcessedNode}
                */
               function processNode(node) {
                  var processedNode = {};

                  // pointer to jQuery node
                  processedNode.jQueryNode = node;

                  // color
                  processedNode.background = node.css('background');
                  processedNode.backgroundColor = node.css('background-color');

                  // height, width
                  processedNode.width = node.width();
                  processedNode.height = node.height();

                  // border
                  // tagname
                  // classname
                  return processedNode;
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

                  // Generate document frequency
                  var documentColors = {};
                  _.each(nodeArray, function(node) {
                     var colorString = node.backgroundColor;
                     var openingParen = colorString.indexOf('(');
                     var closingParen = colorString.indexOf(')');
                     var subColString = colorString.substring(openingParen + 1, closingParen);
                     var rgba = subColString.split(', ');
                     var concatRgba = _.reduce(rgba, function(str, number) {
                        // This creates ambiguous strings that you can't
                        // re-extract RGBA values from, but is sufficient for
                        // figuring out which items are the black sheep.
                        return str + number;
                     });

                     if (typeof documentColors[concatRgba] === 'undefined') {
                        documentColors[concatRgba] = 1;
                     } else {
                        documentColors[concatRgba]++;
                     }

                     node.concatRgba = concatRgba;
                  });

                  // Log document frequency
                  _.each(_.keys(documentColors), function(color) {
                     // console.log(color, documentColors[color]);
                  });

                  // Assign colorWeight
                  _.each(nodeArray, function(node) {
                     // 1 / proportion of color in document
                     // super naive and dumb, but will rank odd colors up
                     var concatRgba = node.concatRgba;
                     node.colorWeight = 1 / documentColors[concatRgba];
                  });

                  return nodeArray;
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
                  _.sortBy(nodeArray, function(node) {
                     return node.sizeWeight;
                  });

                  // Normalize
                  var targetIndex = Math.floor(nodeArray.length * percentile);

                  for (var i = 0; i < nodeArray.length; i++) {
                     var node = nodeArray[i];
                     var targetDistance = 1 / Math.abs(targetIndex - i);
                     // console.log('Size Weight', node.sizeWeight);
                     // console.log('Target Distance', targetDistance);
                     node.sizeWeight = node.sizeWeight * targetDistance;
                     // console.log('Normalized Size Weight', node.sizeWeight);
                     // console.log();
                  }

                  return nodeArray;
               }

               /**
                * Multiplies different weights together to create an
                * aggregate weight.
                *
                * @param {Array.<ProcessedNode>} nodeArray
                */
               function multiplyWeights(nodeArray) {
                  _.each(nodeArray, function(node) {
                     node.weight = node.sizeWeight * node.colorWeight * node.colorWeight;
                  });
               }

               /**
                * Draws a border on the DOM for a node.
                *
                * @param {ProcessedNode} node
                */
               function highlightNode(node) {
                  console.log(node);
                  console.log(node.jQueryNode);
                  console.log(node.jQueryNode.css('border'));
                  console.log(' ');

                  node.jQueryNode.css('border', '3px solid red');
               }

            });

            // phantom.exit(0);
         });
      });
   } else {
      console.error('exit, with errors');
      phantom.exit(1);
   }
});