/*\

title: $:/plugins/felixhayashi/tiddlymap/js/Adapter
type: application/javascript
module-type: library

@module TiddlyMap
@preserve

\*/
(function(){"use strict";var e=require("$:/plugins/felixhayashi/tiddlymap/js/ViewAbstraction").ViewAbstraction;var t=require("$:/plugins/felixhayashi/tiddlymap/js/EdgeType").EdgeType;var i=require("$:/plugins/felixhayashi/tiddlymap/js/NodeType").NodeType;var r=require("$:/plugins/felixhayashi/tiddlymap/js/utils").utils;var s=require("$:/core/modules/macros/contrastcolour.js").run;var o=require("$:/plugins/felixhayashi/vis/vis.js");var a=function(){this.opt=$tw.tmap.opt;this.logger=$tw.tmap.logger;this.indeces=$tw.tmap.indeces;this.visShapesWithTextInside=r.getLookupTable(["ellipse","circle","database","box","text"])};a.prototype.deleteEdge=function(e){return this._processEdge(e,"delete")};a.prototype.deleteEdges=function(e){e=r.convert(e,"array");for(var t=e.length;t--;){this.deleteEdge(e[t])}};a.prototype.insertEdge=function(e){return this._processEdge(e,"insert")};a.prototype._processEdge=function(e,i){this.logger("debug","Edge",i,e);if(typeof e!=="object"||!i||!e.from)return;if(i==="insert"&&!e.to)return;var s=this.indeces.tById[e.from];if(!s||!r.tiddlerExists(s))return;var o=new t(e.type);var a=r.getTiddler(s);var n=o.getNamespace();if(n==="tw-list"){if(!e.to)return;return this._processListEdge(a,e,o,i)}else if(n==="tw-field"){if(!e.to)return;return this._processFieldEdge(a,e,o,i)}else if(n==="tw-body"){return null}else{return this._processTmapEdge(a,e,o,i)}return e};a.prototype._processTmapEdge=function(e,t,i,s){if(s==="delete"&&!t.id)return;var o=r.parseFieldData(e,"tmap.edges",{});if(s==="insert"){t.id=t.id||r.genUUID();o[t.id]={to:t.to,type:i.getId()};if(!i.exists()){i.persist()}}else{delete o[t.id]}r.writeFieldData(e,"tmap.edges",o);return t};a.prototype._processListEdge=function(e,t,i,s){var o=i.getId(true);var a=r.getTiddler(e);var n=$tw.utils.parseStringArray(e.fields[o]);n=(n||[]).slice();var d=this.indeces.tById[t.to];if(s==="insert"){n.push(d);if(!i.exists()){i.persist()}}else{var l=n.indexOf(d);if(l>-1){n.splice(l,1)}}r.setField(a,o,$tw.utils.stringifyList(n));return t};a.prototype._processFieldEdge=function(e,t,i,s){var o=this.indeces.tById[t.to];if(o==null)return;var a=s==="insert"?o:"";r.setField(e,i.getId(true),a);if(!i.exists()){i.persist()}return t};a.prototype.getAdjacencyList=function(e,t){$tw.tmap.start("Creating adjacency list");t=t||{};if(!t.edges){var i=r.getMatches(this.opt.selector.allPotentialNodes);t.edges=this.getEdgesForSet(i,t.toWL,t.typeWL)}var s=r.groupByProperty(t.edges,e);$tw.tmap.stop("Creating adjacency list");return s};a.prototype.getNeighbours=function(e,t){$tw.tmap.start("Get neighbours");t=t||{};e=e.slice();var i=t.addProperties;var s=this.getAdjacencyList("to",t);var o=r.getDataMap();var a=r.getDataMap();var n=parseInt(t.steps)>0?t.steps:1;var d=function(){var n=r.getArrayValuesAsHashmapKeys(e);for(var d=e.length;d--;){if(r.isSystemOrDraft(e[d]))continue;var l=this.getEdges(e[d],t.toWL,t.typeWL);$tw.utils.extend(o,l);for(var p in l){var g=this.indeces.tById[l[p].to];if(!n[g]&&!a[l[p].to]){var f=this.makeNode(g,i);if(f){a[l[p].to]=f;e.push(g)}}}var c=s[this.indeces.idByT[e[d]]];if(c){for(var h=0;h<c.length;h++){var u=this.indeces.tById[c[h].from];if(n[u])continue;if(!a[c[h].from]){var f=this.makeNode(u,i);if(f){a[c[h].from]=f;e.push(u)}}o[c[h].id]=c[h]}}}}.bind(this);for(var l=0;l<n;l++){var p=e.length;d();if(p===e.length)break}var g={nodes:a,edges:o};this.logger("debug","Retrieved neighbourhood",g,"steps",l);$tw.tmap.stop("Get neighbours");return g};a.prototype.getGraph=function(t){$tw.tmap.start("Assembling Graph");t=t||{};var i=new e(t.view);var s=r.getMatches(t.filter||i.getNodeFilter("compiled"));var o=r.getArrayValuesAsHashmapKeys(s);var a=this.getEdgeTypeWhiteList(i.getEdgeFilter("compiled"));var n=parseInt(t.neighbourhoodScope||i.getConfig("neighbourhood_scope"));var d={edges:this.getEdgesForSet(s,o,a),nodes:this.selectNodesByReferences(s,{view:i,outputType:"hashmap"})};if(n){var l=this.getNeighbours(s,{steps:n,view:i,typeWL:a,addProperties:{group:"tmap:neighbour"}});r.merge(d,l);if(i.isEnabled("show_inter_neighbour_edges")){var p=this.getTiddlersById(l.nodes);var o=r.getArrayValuesAsHashmapKeys(p);$tw.utils.extend(d.edges,this.getEdgesForSet(p,o))}}this._removeObsoleteViewData(d.nodes,i);this.attachStylesToNodes(d.nodes,i);$tw.tmap.stop("Assembling Graph");this.logger("debug","Assembled graph:",d);return d};a.prototype.getEdges=function(e,t,i){if(!r.tiddlerExists(e)||r.isSystemOrDraft(e)){return}var s=r.getTiddler(e);var o=r.getTiddlerRef(e);var a=this._getTmapEdges(e,t,i);var n=r.getMatches($tw.tmap.opt.selector.allListEdgeStores);var d=r.getDataMap();d["tw-body:link"]=$tw.wiki.getTiddlerLinks(o);for(var l=n.length;l--;){d["tw-list:"+n[l]]=$tw.utils.parseStringArray(s.fields[n[l]])}var n=r.getMatches($tw.tmap.opt.selector.allFieldEdgeStores);for(var l=n.length;l--;){d["tw-field:"+n[l]]=[s.fields[n[l]]]}$tw.utils.extend(a,this._getEdgesFromRefArray(o,d,t,i));return a};a.prototype._getEdgesFromRefArray=function(e,i,s,o){var a=r.getDataMap();for(var n in i){var d=i[n];if(!d||o&&!o[n])continue;n=new t(n);for(var l=d.length;l--;){var p=d[l];if(!p||!$tw.wiki.tiddlerExists(p)||r.isSystemOrDraft(p)||s&&!s[p])continue;var g=n.getId()+$tw.utils.hashString(e+p);var f=this.makeEdge(this.getId(e),this.getId(p),n,g);if(f){a[f.id]=f}}}return a};a.prototype._getTmapEdges=function(e,t,i){var s=r.parseFieldData(e,"tmap.edges",{});var o=r.getDataMap();for(var a in s){var n=s[a];var d=this.indeces.tById[n.to];if(d&&(!t||t[d])&&(!i||i[n.type])){var l=this.makeEdge(this.getId(e),n.to,n.type,a);if(l){o[a]=l}}}return o};a.prototype.getEdgeTypeWhiteList=function(e){var i=r.getDataMap();var s=r.getMatches(this.opt.selector.allEdgeTypes);var o=e?r.getMatches(e,s):s;for(var a=o.length;a--;){var n=new t(o[a]);i[n.getId()]=n}return i};a.prototype.getEdgesForSet=function(e,t,i){var s=r.getDataMap();for(var o=e.length;o--;){$tw.utils.extend(s,this.getEdges(e[o],t,i))}return s};a.prototype.selectEdgesByType=function(e){var i=r.getDataMap();i[new t(e).getId()]=true;var s=r.getMatches(this.opt.selector.allPotentialNodes);var o=this.getEdgesForSet(s,null,i);return o};a.prototype._processEdgesWithType=function(e,i){e=new t(e);this.logger("debug","Processing edges",e,i);var r=this.selectEdgesByType(e);if(i.action==="rename"){var s=new t(i.newName);s.loadDataFromType(e);s.persist()}for(var o in r){this._processEdge(r[o],"delete");if(i.action==="rename"){r[o].type=i.newName;this._processEdge(r[o],"insert")}}$tw.wiki.deleteTiddler(e.getPath())};a.prototype.selectNodesByFilter=function(e,t){var i=r.getMatches(e);return this.selectNodesByReferences(i,t)};a.prototype.selectNodesByReferences=function(e,t){t=t||{};var i=t.addProperties;var s=r.getDataMap();var o=Object.keys(e);for(var a=o.length;a--;){var n=this.makeNode(e[o[a]],i);if(n){s[n.id]=n}}return r.convert(s,t.outputType)};a.prototype.selectNodesByIds=function(e,t){var i=this.getTiddlersById(e);return this.selectNodesByReferences(i,t)};a.prototype.selectNodeById=function(e,t){t=r.merge(t,{outputType:"hashmap"});var i=this.selectNodesByIds([e],t);return i[e]};a.prototype.makeEdge=function(e,i,s,o){if(!e||!i)return;if(e instanceof $tw.Tiddler){e=e.fields[this.opt.field.nodeId]}else if(typeof e==="object"){e=e.id}s=new t(s);var a={id:o||r.genUUID(),from:e,to:i,type:s.getId(),title:s.getData("description")||undefined};a.label=r.isTrue(s.getData("show-label"),true)?s.getLabel():null;a=$tw.utils.extend(a,s.getData("style"));return a};a.prototype.removeNodeType=function(e){$tw.wiki.deleteTiddler(new i(e).getPath())};a.prototype.makeNode=function(e,t){var i=r.getTiddler(e);if(!i||i.isDraft()||$tw.wiki.isSystemTiddler(i.fields.title)){return}var s=r.merge({},t);s.id=this.assignId(i);var o=i.fields[this.opt.field.nodeLabel];s.label=o&&this.opt.field.nodeLabel!=="title"?$tw.wiki.renderText("text/plain","text/vnd-tiddlywiki",o):i.fields.title;return s};a.prototype.getInheritedNodeStyles=function(t,i){i=i?new e(i).getLabel():null;var s=this.getTiddlersById(t);var o={};var a=this.indeces.loGlNTy;for(var n=a.length;n--;){var d=a[n].data;if(i&&d.view&&d.view!==i)continue;var l=a[n].getInheritors(s);if(!l.length)continue;for(var p=l.length;p--;){var g=l[p];o[g]=o[g]||{};o[g].style=r.merge(o[g].style||{},d.style);if(d["fa-icon"]){o[g]["fa-icon"]=d["fa-icon"]}else if(d["tw-icon"]){o[g]["tw-icon"]=d["tw-icon"]}}}return o};a.prototype.attachStylesToEdges=function(e,t){};a.prototype._removeObsoleteViewData=function(t,i){i=new e(i);if(!i.exists()||!t)return;var r=i.getNodeData();var s=0;for(var o in r){if(t[o]===undefined){delete r[o];s++}}if(s){this.logger("debug","Removed "+s+" node data records from view "+i.getLabel());i.saveNodeData(r)}};a.prototype.attachStylesToNodes=function(t,o){o=new e(o);var a=this.getInheritedNodeStyles(t,o);var n=new i("tmap:neighbour").getData("style");var d=o.exists()?o.getNodeData():{};var l=!o.isEnabled("physics_mode");var p=this.opt.field.nodeInfo;var g=this.opt.field.nodeIcon;var f=this.indeces.tById;for(var c in t){var h=f[c];var u=$tw.wiki.getTiddler(h);var v=u.fields;var y=t[c];if(a[h]){if(a[h].style){r.merge(y,a[h].style)}this._addNodeIcon(y,a[h]["fa-icon"],a[h]["tw-icon"])}if(y.group==="tmap:neighbour"){r.merge(y,n);delete y.group}if(v.color){y.color=v.color}if(v["tmap.style"]){r.merge(y,r.parseJSON(v["tmap.style"]))}this._addNodeIcon(y,v["tmap.fa-icon"],v[g]);if(d[c]){r.merge(y,d[c]);if(l){y.fixed={x:true,y:true}}}y.color=typeof y.color==="object"?y.color.background:y.color;y.font=y.font||{};if(typeof y.font==="object"&&!y.font.color){var w=y.shape;if(w&&!this.visShapesWithTextInside[w]){y.font.color="black"}else{if(y.color){y.font.color=s(y.color,y.color,"black","white")}}}if(y.shape==="icon"&&typeof y.icon==="object"){y.icon.color=y.color}if(v[p]){y.title=$tw.wiki.renderText("text/html","text/vnd-tiddlywiki",v[p])}else if(y.label!==h){y.title=h}}};a.prototype.deleteNode=function(t){if(!t)return;var i=typeof t==="object"?t.id:t;var s=this.indeces.tById[i];if(s){r.deleteTiddlers([s])}var o=$tw.tmap.opt.selector.allViews;var a=r.getMatches(o);for(var n=0;n<a.length;n++){var d=new e(a[n]);if(d.getNodeData(i)){d.saveNodeData(i,null)}}var l=this.getNeighbours([s]);this.deleteEdges(l.edges)};a.prototype.getView=function(t,i){return new e(t,i)};a.prototype.createView=function(t){if(typeof t!=="string"||t===""){t="My view"}var i=$tw.wiki.generateNewTitle(this.opt.path.views+"/"+t);return new e(i,true)};a.prototype.createType=function(e,r){r=r||"me:new-type";var s=e==="edge"?this.opt.path.edgeTypes:this.opt.path.nodeTypes;var o=$tw.wiki.generateNewTitle(s+"/"+r);var e=e==="edge"?new t(o):new i(o);e.persist();return e};a.prototype.storePositions=function(t,i){i=new e(i);i.saveNodeData(t)};a.prototype.assignId=function(e,t){var i=r.getTiddler(e,true);if(!i)return;var s=this.opt.field.nodeId;var o=i.fields[s];if(!o||t&&s!=="title"){o=r.genUUID();r.setField(i,s,o);this.logger("info","Assigning new id to",i.fields.title)}this.indeces.tById[o]=i.fields.title;this.indeces.idByT[i.fields.title]=o;return o};a.prototype.insertNode=function(t,i){if(!i||typeof i!=="object")i={};if(!t||typeof t!=="object"){t=r.getDataMap()}var s=r.getDataMap();s.title=$tw.wiki.generateNewTitle(t.label?t.label:"New node");t.label=s.title;if(this.opt.field.nodeId==="title"){t.id=s.title}else{t.id=r.genUUID();s[this.opt.field.nodeId]=t.id}if(i.view){var o=new e(i.view);o.addNodeToView(t)}$tw.wiki.addTiddler(new $tw.Tiddler(s,$tw.wiki.getModificationFields(),$tw.wiki.getCreationFields()));return t};a.prototype.getTiddlersById=function(e){if(Array.isArray(e)){e=r.getArrayValuesAsHashmapKeys(e)}else if(e instanceof o.DataSet){e=r.getLookupTable(e,"id")}var t=[];var i=this.indeces.tById;for(var s in e){if(i[s])t.push(i[s])}return t};a.prototype.getId=function(e){return this.indeces.idByT[r.getTiddlerRef(e)]};a.prototype._addNodeIcon=function(e,t,i){if(t){e.shape="icon";e.icon={shape:"icon",face:"FontAwesome",color:e.color,code:String.fromCharCode("0x"+t)};return}if(!i)return;var s=r.getTiddler(i);if(s&&s.fields.text){var o=s.fields.type||"image/svg+xml";var a=s.fields.text;e.shape="image";if(o==="image/svg+xml"){a=a.replace(/\r?\n|\r/g," ");if(!r.inArray("xmlns",a)){a=a.replace(/<svg/,'<svg xmlns="http://www.w3.org/2000/svg"')}}var n=$tw.config.contentTypeInfo[o].encoding==="base64"?a:window.btoa(a);e.image="data:"+o+";base64,"+n}};exports.Adapter=a})();