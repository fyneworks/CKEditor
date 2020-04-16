/*
 ### jQuery CKEditor Plugin v2.0.4 - 2014-05-15 ###
 * http://www.fyneworks.com/ - diego@fyneworks.com
  * Licensed under http://en.wikipedia.org/wiki/MIT_License
 ###
 Project: http://jquery.com/plugins/project/CKEditor/
 Website: http://www.fyneworks.com/jquery/CKEditor/
*/
/*
 USAGE: $('textarea').ckeditor({ path:'/path/to/ckeditor/editor/' }); // initialize CKEditor
 ADVANCED USAGE: $.ckeditor.update(); // update value in textareas of each CKEditor instance
*/

/*# AVOID COLLISIONS #*/;
if (window.jQuery)(function ($) {
  /*# AVOID COLLISIONS #*/

  // catastrophic failure reporting
  var fail = (window.console ? console.error : alert);

  // let's begin
  $.extend($, {
    ckeditor: {
      waitFor: 10, // in seconds, how long should we wait for the script to load?
      config: {}, // default configuration
      path: '/CKEditor/', // default path to CKEditor directory
      selector: 'textarea.ckeditor', // jQuery selector for automatic replacements
      editors: [], // array of element ids pointing to CKEditor instances
      loaded: false, // flag indicating whether CKEditor script is loaded

      //----------------------------------------------------------------------------------------------------

      // name of methods that should be automcatically intercepted so the plugin can disable
      autoIntercept: ['submit', 'ajaxSubmit', 'ajaxForm', 'validate', 'valid' /* array of methods to intercept */ ],
      // variable to store intercepted method(s)
      intercepted: {},
      // intercept handler
      intercept: function (methods, context, args) {
        var method, value;
        args = args || [];
        if (args.constructor.toString().indexOf("Array") < 0) args = [args];
        if (typeof (methods) == 'function') {
          $.ckeditor.update();
          value = methods.apply(context || window, args);
          return value;
        };
        if (methods.constructor.toString().indexOf("Array") < 0) methods = [methods];
        for (var i = 0; i < methods.length; i++) {
          method = methods[i] + ''; // make sure that we have a STRING
          if (method)(function (method) { // make sure that method is ISOLATED for the interception
            $.ckeditor.intercepted[method] = $.fn[method] || function () {};
            $.fn[method] = function () {
              $.ckeditor.update();
              value = $.ckeditor.intercepted[method].apply(this, arguments);
              return value;
            }; // interception
          })(method); // MAKE SURE THAT method IS ISOLATED for the interception
        }; // for each method
      }, // $.ckeditor.intercept

      //----------------------------------------------------------------------------------------------------

      // function to load instance of CKEditor
      instance: function (i) {
        //console.log(['ckeditor.instance','i',i]);
        var x = null;
        if(i){
          if(typeof(i)=='object'){
            if(i.instanceReady)
              x = i;
            else{
              var j = $(i);
              if(j.length) x = j.data('ckeditor');
            };
          }
          else{
            //console.log(['ckeditor.instance','STRING']);
            x = CKEDITOR.instances[i];
            //console.log(['ckeditor.instance','TRIED',x]);
          };
        };
        // Look for textare with matching name for backward compatibility
        if (!x && typeof(i)=='string') {
          var e = $('#' + i.replace(/\./gi, '\\\.') + '');
          //console.log(['ckeditor.instance','ele',x]);
          if(e && e.length){
            x = e.data('ckeditor') || CKEDITOR.instances[e.attr('id')];
          };
        };
        //console.log(['ckeditor.instance','x',x]);
        
        if(x && typeof(x)!='undefined') return x;
        fail('CKEditor instance "' + i + '" could not be found!');
        return null;
      },

      // function to READ and WRITE contents of a CKEditor instance
      content: function (i, v) {
        //console.log(['ckeditor.content',arguments]);
        var o='';
        // get local instance
        var x = $.ckeditor.instance(i);
        if(x && typeof(x)!='undefined'){
          if (v && typeof(v) != 'undefined' && typeof(v)=='string') {
            //console.log(['ckeditor.content',x,'x.setData',v]);
            x.setData(v);
          };
          //console.log('>>> getData');
          o = x.getData();
          //console.log('<<< gotData');
        };
        //console.log(['ckeditor.content','getData',x.getData(true)]);
        return o;
      }, // ckeditor.content function

      //----------------------------------------------------------------------------------------------------

      // Legacy methods
      // inspired by Sebastián Barrozo <sbarrozo@b-soft.com.ar>
      getHTML: function (i, v) {
        //console.log(['ckeditor.getHTML',arguments]);
        if (typeof i == 'object'){
          v = i.html;
          i = i.name || i.instance || i.id;
        };
        return $.ckeditor.content(i, v);
      },
      setHTML: function (i, v) {
        //console.log(['ckeditor.setHTML',arguments]);
        return $.ckeditor.getHTML(i, v);
      },
      
      // Let's mimic the official adapter too
      // http://docs.ckeditor.com/#!/api/CKEDITOR_Adapters.jQuery
      getData: function(i, v){ return $.ckeditor.content(i, v); },
      setData: function(i, v){ return $.ckeditor.content(i, v); },
      val: function(i, v){ return $.ckeditor[typeof v!='undefined'?'setHTML':'content'](i, v); },

      //----------------------------------------------------------------------------------------------------
      
      // utility method to update textarea contents before ajax submission
      update: function () {
        // Remove old non-existing editors from memory
        $.ckeditor.clean();
        // loop through editors
        //console.log(['ckeditor.update','before',$.ckeditor.editors/*,CKEDITOR.instances*/]);
        //$.each($.ckeditor.editors,function(i,name){
        for (var i = 0; i < $.ckeditor.editors.length; i++) {
          var name = $.ckeditor.editors[i];
          //console.log(['ckeditor.update',name,CKEDITOR.instances[name]]);
          var area = $('#' + name.replace(/\./g, '\\\.'));
          if (area.length > 0) {
            var data = $.ckeditor.content(name); // CKEDITOR.instances[name].getData();
            //console.log(['ckeditor.update','-->',area,data.length]);
            area.val(data).text(data);
          };
          //});
        };
        //console.log(['ckeditor.update','done',$.ckeditor.editors/*,CKEDITOR.instances*/]);
      }, // ckeditor.update

      // utility method to clear orphan instances from memory
      clean: function () {
        if(!window.CKEDITOR) return;
        //console.log(['ckeditor.clean','before',$.ckeditor.editors]);
        //console.log(['ckeditor.clean','before(B)',CKEDITOR.instances]);
        for(var name in CKEDITOR.instances){
          //console.log(['ckeditor.clean',name,'CKEDITOR:',CKEDITOR.instances[name]]);
          //console.log(['ckeditor.clean',name,'CKEDITOR.textarea:',CKEDITOR.instances[name]?CKEDITOR.instances[name].textarea:null]);
          var inst = CKEDITOR.instances[name];
          //console.log(['ckeditor.clean',name.replace(/\./gi,'\\\.'),'???']);
          var area = $('textarea[id='+inst.name.replace(/\./gi,'\\\.')+']');
          //console.log(['ckeditor.clean',name,'inst:',inst]);
          //console.log(['ckeditor.clean',name,'inst.textarea:',inst.textarea]);
          //console.log(['ckeditor.clean',name,'area:',area]);
          if (area.length == 0 || !inst || inst.textarea != area[0]) {
            //console.log(['ckeditor.clean',name,'DOES NOT EXIST']);
            //console.log(['ckeditor.clean',name,'editors.splice('+i+')']);
            var i = $.ckeditor.editors.indexOf(name);
            $.ckeditor.editors.splice(i,1);
            //console.log(['ckeditor.clean',name,'delete CKEDITOR.instances['+name+']']);
            if (CKEDITOR.instances[name]) {
              //CKEDITOR.instances[name].destroy(false /* don't update element */ );
              delete CKEDITOR.instances[name];
            };
            //console.log(['ckeditor.clean',name,'CKEDITOR.instances['+name+'].destroy()']);
            //inst.destroy();
          };
          //});
        }; // for
        //console.log(['ckeditor.clean','after',$.ckeditor.editors]);
        //console.log(['ckeditor.clean','after(B)',CKEDITOR.instances]);
        //console.log(['ckeditor.clean','FINISHED']);
      }, // ckeditor.clean

      // utility method to create instances of CKEditor (if any)
      create: function (options) {
        // Create a new options object
        var o = $.extend( /* THIS IS CRITICAL */ true, {} /* new object */ , $.ckeditor.config || {}, options || {});
        // Normalize plugin options
        $.extend(o, {
          selector: o.selector || $.ckeditor.selector,
          basePath: o.path || o.basePath || (window.CKEDITOR_BASEPATH ? CKEDITOR_BASEPATH : $.ckeditor.path)
        });
        //console.log(['ckeditor.create','o',o]);
        // Find ckeditor.editor-instance 'wannabes'
        var e = o.e ? $(o.e) : undefined;
        if (!e || !e.length > 0) e = $(o.selector);
        //console.log(['ckeditor.create','e',e]);
        if (!e || !e.length > 0) return;
        //console.log(['ckeditor.create','loaded?',$.ckeditor.loaded]);
        //console.log(['ckeditor.create','loading?',$.ckeditor.loading]);
        // Load script and create instances
        if (!$.ckeditor.loading && !$.ckeditor.loaded) {
          //console.log(['ckeditor.create','load script']);
          $.ckeditor.loading = true;
          $.getScript(
            o.basePath + 'CKEditor.js',
            function () {
              $.ckeditor.loaded = true;
            }
          );
        };
        // Start editor
        var start = function () { //e){
          //console.log(['ckeditor.create','start','loaded?',$.ckeditor.loaded]);
          if ($.ckeditor.loaded) {
            //console.log(['ckeditor.create','start','loaded!',e,o]);
            $.ckeditor.editor(e, o);
          } else {
            //console.log(['ckeditor.create','start','waiting:',e,o]);
            if ($.ckeditor.waited <= 0) {
              alert('jQuery.CKEditor plugin error: The CKEditor script did not load.');
            } else {
              $.ckeditor.waitFor--;
              window.setTimeout(start, 1000);
            };
          }
        };
        start(e);
        // Return matched elements...
        return e;
      },

      // utility method to create an instance of CKEditor
      editor: function (e /* elements */ , o /* options */ ) {
        // Create a local over-loaded copy of the default configuration
        o = $.extend({}, $.ckeditor.config || {}, o || {});
        // Make sure we have a jQuery object
        e = $(e);
        //console.log(['ckeditor.editor','E',e,'o',o]);
        if (e.size() > 0) {
          // Go through objects and initialize ckeditor.editor
          e.each(
            function (i, t) {
              //console.log(['ckeditor.editor','each','t',i,t]);
             
              /* this is OK as of v2.0.3
              if ((t.tagName || '').toLowerCase() == 'textarea')
                return alert(['An invalid parameter has been passed to the $.CKEditor.editor function', 'tagName:' + t.tagName, 'name:' + t.name, 'id:' + t.id].join('\n'));
              */
             
              //console.log(['ckeditor.editor','each','t.ckeditor',t.ckeditor]);
              if (!t.ckeditor /* not already installed */ ) {
                // Have a jQuery array ready
                var T = $(t); // t = element, T = jQuery
                var inline = !T.is("textarea"); //((t.tagName || '').toLowerCase() != 'textarea')?true:false;
                // if not textarea, make sure it's editable
                if(inline) T.attr('contentEditable','true');//.prop('contentEditable',true);
                // make sure the element has an id
                t.id = t.id || T.attr('id') || 'ckeditor' + ($.ckeditor.editors.length + 1);
                $.ckeditor.editors[$.ckeditor.editors.length] = t.id;
                //console.log(['ckeditor.editor','>>>>>>>> t.id',t.id]);
                //console.log(['ckeditor.editor','>>>>>>>> $.ckeditor.editors',$.ckeditor.editors]);
                // make sure the element has a name
                if(!inline) t.name = t.name || t.id;
                //console.log(['ckeditor.editor','>>>>>>>> t.name',t.name]);
                //console.log(['ckeditor.editor','metadata',T.metadata()]);
                // Accept settings from metadata plugin
                var config = $.extend(true, {}, o, ($.meta ? T.data() /*NEW metadata plugin*/ :
                  ($.metadata ? T.metadata() /*OLD metadata plugin*/ :
                    null /*metadata plugin not available*/ )) || {});
                // normalize configuration one last time...
                config = $.extend(config, {
                  width: (o.width || o.Width || T.width() || '100%'),
                  height: (o.height || o.Height || T.height() || '500px'),
                  basePath: (o.path || o.basePath),
                  toolbar: (o.toolbar || o.ToolbarSet || undefined) // 'Default')
                });
                //console.log(['ckeditor.editor','make','t',t]);
                //console.log(['ckeditor.editor','make','t.id',t.id]);
                //console.log(['ckeditor.editor','make','config',config]);
                //console.log(['ckeditor.editor','make','config',config.toolbarGroups]);

                //console.log('ckeditor make',t,config);
                // create CKEditor instance (now supposrts inline editors too, as of v2.0.3)
                //var editor = CKEDITOR.replace(t.id, config);
                var editor = inline ? CKEDITOR.inline(t.id, config) : CKEDITOR.replace(t.id, config);

                // NEW May 2014 v2 : EVENT HANDLING
                editor.on("instanceReady", function(event) {

                    //var editor = event.editor;
                    setTimeout(function() {
                        //if (editor.element) {
                            event.removeListener();
                            editor.on("dataReady", function() {
                                //console.log("dataReady.ckeditor", [editor])
                                T.trigger("dataReady.ckeditor", [editor])
                            });
                            editor.on("setData", function($) {
                                //console.log("setData.ckeditor", [editor, $.data])
                                T.trigger("setData.ckeditor", [editor, $.data])
                            });
                            editor.on("getData", function($) {
                                //console.log("getData.ckeditor", [editor, $.data])
                                T.trigger("getData.ckeditor", [editor, $.data])
                            }, 999);
                            editor.on("destroy", function() {
                                //console.log("destroy.ckeditor", [editor])
                                T.trigger("destroy.ckeditor", [editor])
                            });
                            editor.on("save", function() {
                                $(h.form).submit();
                                return !1
                            }, null, null, 20);
                            if (editor.config.autoUpdateElementJquery && T.is("textarea") && $(h.form).length) {
                                var c = function() {
                                    editor = editor || T.data('ckeditor') || $.ckeditor.instance(T.attr('id'));
                                    editor.updateElement();
                                    //T.ckeditor(function() { editor.updateElement() })
                                };
                                $(h.form).submit(c);
                                $(h.form).bind("form-pre-serialize", c);
                                T.bind("destroy.ckeditor", function() {
                                    $(h.form).unbind("submit", c);
                                    $(h.form).unbind("form-pre-serialize", c)
                                })
                            }
                            editor.on("destroy", function() {
                                T.removeData("ckeditor")
                            });
                            T.removeData("_ckeditorInstanceLock");
                            T.trigger("instanceReady.ckeditor", [editor]);
                            //g && g.apply(editor, [h]);
                            //j.resolve()
                        //} else setTimeout(arguments.callee,
                        //100)
                    }, 0)

                }, null, null, 9999)
                
                //console.log(['ckeditor.editor','make','editor',editor]);
                // Store reference to element in CKEditor object
                editor.textarea = t;
                // Store reference to CKEditor object in element
                t.ckeditor = editor;
                // Mark this editor so we know if a new editor
                // with the same id has taken its place
                T.addClass('is-ckeditor').data('ckeditor',editor);
                //console.log(['ckeditor.editor','make','done!']);
              };
            }
          );
          // Remove old non-existing editors from memory
          $.ckeditor.clean();
        };
        // return jQuery array of elements
        return e;
      }, // ckeditor.editor function

      // start-up method
      start: function (o /* options */ ) {
        // Drop dead instances
        //console.log(['ckeditor.start','clean']);
        $.ckeditor.clean();

        //console.log(['ckeditor.start','intercept form']);
        // this code will automatically intercept native form submissions
        $('form')
          .not('ckeditor-intercepted')
          .addClass('ckeditor-intercepted')
          .on('submit form-pre-serialize',function () {
            $.ckeditor.update()
          });

        //console.log(['ckeditor.start','intercept plugins']);
        // utility method to integrate this plugin with others...
        if ($.ckeditor.autoIntercept) {
          $.ckeditor.intercept($.ckeditor.autoIntercept /* array of methods to intercept */ );
          $.ckeditor.autoIntercept = null; /* only run this once */
        };

        // Create CKEDITOR
        return $.ckeditor.create(o);
      } // ckeditor.start

    } // ckeditor object
    //##############################

  });
  // extend $
  //##############################


  $.extend($.fn, {
    ckeditor: function (o, d){
      //console.log(['ckeditor',this]);

      // Provide quick access to CKEditor Instance Object
      if (this.length == 1 && this[0].id && window.CKEDITOR) {
        var e = CKEDITOR.instances[this[0].id];
        if (e == this[0]) {
          //console.log(['ckeditor','already exists:',CKEDITOR.instances[this[0].id]]);
          return CKEDITOR.instances[this[0].id];
        } else {
          //console.log(['ckeditor','edit not created for:',this[0]]);
          $.ckeditor.clean();
        };
      };
      
      // API methods
      if(o && typeof(o)=='string'){
        //console.log(['ckeditor','call api method:',o,this]);
        
        // recognize common methods, accept many variations
        if(o.match(/^(let|set|get|write|read)(data|html)?$/i)) o = 'content';

        // find method (once)
        var m = $.ckeditor[o];

        // execute method on each element individually
        // will write to all, but can only read from first
        var v = '';
        $(this).each(function(){
          //console.log(['ckeditor','invoke api method:',o,this]);
          
          // only on elements that have an instance
          var i = $(this).data('ckeditor');
          if(i){
            // warn if method not found (once per element)
            if(typeof(m)!='function'){
              return !1==fail('CKEditor plugin: invalid API method "'+o+'"');
            }
            else{
              var h = m.apply($.ckeditor,[i, d]);
              v = v || h;
            };
          };

        });
        return v;

      }
      else{
        //console.log(['ckeditor','make editors for:',this]);

        // Let's make some editors! :-)
        return $(this).each(function() {
          //console.log(['ckeditor','each','t',this]);
          $.ckeditor.start(
            $.extend({}, // create a new options object
              o || {}, // overload with this call's options parameter
              {
                e: this
              } // store reference to self
            ) // $.extend
          ); // $.ckeditor.start
        }); // each element

      };

      //console.log(['ckeditor','done','editors:',$.editor.editors]);

    } //$.fn.ckeditor
  });
  // extend $.fn
  //##############################

  /*# AVOID COLLISIONS #*/
})(jQuery);
/*# AVOID COLLISIONS #*/
