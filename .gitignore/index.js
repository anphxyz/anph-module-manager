#!/usr/bin/env node

/**
 * author: ANPH
 * create & destroy Module
 * usage: [ 
 *          0. `piepme-express` shell script now ready with `npm link at begin`
 *          1. npm install commander [--save-dev] at begin
 *          2. create module: node mk-module -c(--create) <moduleName>
 *          2. destroy module: node mk-module -d(--destroy) <moduleName>
 *        ]
 * notice: be careful thinking before hitting enter, there is no way back from future
 */

const AnphTool = (() => {
  let instance;
  init = () => {
    const fs = require('fs'),

      TAG_RMV = '<REMOVE ME TO BEGIN FB1D2631C12FE8F7EE8951663A8A1081>',

      //STAT 
      _notFound = 'NOT_FOUND', _denied = 'DENIED', _existed = 'EXISTED',

      //particular name
      FCTR = 'FCTR', CTRL = 'CONTROLLER',
      FMOD = 'FMOD', MODE = 'MODEL',
      FROU = 'FROU', ROUT = 'ROUTER',
      CLJS = 'CLIENTJS',
      CSSS = 'CSS',
      FVIE = 'FVIE', VIEW = 'VIEW'
    //pad number < 10 left

    const padLeft = num => +num < 10 ? '0' + num : num
    const toCapilalize = lower => lower.charAt(0).toUpperCase() + lower.substr(1)
    const _getFirstCharater = mdlName => '_' + mdlName.charAt(0)

    const _getCreatedDate = () => {
      let date = new Date()//+ 7 in hour -> GMT +7
      date = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
      return `${padLeft(date.getDate())}/${padLeft(date.getMonth() + 1)}/${date.getFullYear()} ${padLeft(date.getHours() + 7)}:${padLeft(date.getMinutes())}:${padLeft(date.getSeconds())}`
    }

    const _getModuleInfo = mdlName => ({// DEFINE STRUCTURE FOLDER
      [FCTR]: `./server/controllers/${_getFirstCharater(mdlName)}`,
      [CTRL]: `./server/controllers/${_getFirstCharater(mdlName)}/${mdlName}.js`,
      [FMOD]: `./server/model/${_getFirstCharater(mdlName)}`,
      [MODE]: `./server/model/${_getFirstCharater(mdlName)}/${mdlName}Model.js`,
      [FROU]: `./server/router/${_getFirstCharater(mdlName)}`,
      [ROUT]: `./server/router/${_getFirstCharater(mdlName)}/${mdlName}.js`,
      [CLJS]: `./client/js/dev/modules.${mdlName}.js`,
      [CSSS]: `./client/css/dev/${mdlName}.css`,
      [FVIE]: `./views/${mdlName}`,
      [VIEW]: `./views/${mdlName}/${mdlName}_view.ejs`
    })

    //header comment
    const _getModuleDescription = (mdlName, particularName) => [CSSS, VIEW].indexOf(particularName) > -1 ? TAG_RMV :
      `${TAG_RMV}\n/*\n * Author: ${require('os').userInfo().username.toLocaleUpperCase()}\n * Create: ${_getCreatedDate()}\n * ${mdlName.toUpperCase()} ${particularName.toUpperCase()}\n */`

    //template string per file
    const _sampleCode = mdlName => ({
      // /|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\
      [CTRL]: `const PIEPME = require('../PIEPME'),\n\t${toCapilalize(mdlName)}Model = require('../../model/${_getFirstCharater(mdlName)}/${mdlName}Model')\nmodule.exports = class ${toCapilalize(mdlName)} extends PIEPME {\n\tconstructor() {\n\t\tsuper()\n\t\tthis.${mdlName}Model = new ${toCapilalize(mdlName)}Model()\n\t}\n\t_${mdlName} (req, res){\n\t\tres.render('${mdlName}/${mdlName}_view.ejs', {})\n\t}\n}`,
      [MODE]: `const MODEL = require('../MODEL')\nmodule.exports = class ${toCapilalize(mdlName)}Model extends MODEL {\n\tconstructor() { super() }\n}`,
      [CLJS]: `'use strict';\nwindow.onload = function () {//call method public here\n\t//${mdlName}Plugin.getInstance().fn();\n}\nvar ${mdlName}Plugin = (function () {\n\tvar instance;\n\tfunction init() {\n\t\tfunction eventListener() { }\n\t\treturn {//what to public\n\t\t}\n\t}\n\treturn {\n\t\tgetInstance: function () {\n\t\tif (!instance) //make sure only 1 object created\n\t\t\t\tinstance = init();\n\t\t\treturn instance;\n\t\t}\n\t}\n})();`,
      [CSSS]: '',
      [VIEW]: `<%- include('../layout/header', { css: ['/css/${mdlName}.css'] }); %>\n\n<%- include('../layout/footer'); %>\n<script src="/js/modules.${mdlName}.js"></script>\n</html>`,
      [ROUT]: `const ${toCapilalize(mdlName)} = require('../../controllers/${_getFirstCharater(mdlName)}/${mdlName}')\n\n\tmodule.exports = app => {\n\const ctrl${toCapilalize(mdlName)} = new ${toCapilalize(mdlName)} ()\n\tapp.get('/${mdlName}', (req, res) => ctrl${toCapilalize(mdlName)}._${mdlName}(req, res))\n}`
    })

    //get message with exactly case
    const _getMessage = (tag, path) =>
      tag === _notFound ? `FILE NOT FOUND: ${path}` :
        tag === _denied ? `ACCESS  ${_denied}: ${path}` :
          tag === _existed ? `OPPS!  ${_existed}: ${path}` : ''

    //
    const _checkTagRmv = path => !fs.existsSync(path) ? _notFound : fs.readFileSync(path).toString('utf-8').split("\n")[0].trim() === TAG_RMV ? true : _denied

    //create 1 file with required
    const _generateFile = (mdlName, path, keySample, fpath) => {
      !!fpath && !fs.existsSync(fpath) && fs.mkdirSync(fpath)

      if (!fs.existsSync(path)) {
        fs.writeFileSync(path, `${_getModuleDescription(mdlName, keySample)}\n${_sampleCode(mdlName)[keySample]}`);
        return path;
      } else return _getMessage(_existed, path);
    }

    //remove 1 file from xpath
    const _destroyFile = (xpath, folder = '', isForce = false) => {
      const canRemove = isForce || _checkTagRmv(xpath);
      if (+canRemove) {
        fs.unlink(xpath, err => {
          if (err) throw err;
          if (folder && !fs.readdirSync(folder).length)
            fs.rmdirSync(folder)
        });
        return xpath;
      } else return _getMessage(canRemove, xpath);
    }

    //create file follow defined structure
    const _makeModule = mdlName => {
      const path = _getModuleInfo(mdlName);
      return [
        _generateFile(mdlName, path[CTRL], CTRL, path[FCTR]),
        _generateFile(mdlName, path[MODE], MODE, path[FMOD]),
        _generateFile(mdlName, path[ROUT], ROUT, path[FROU]),
        _generateFile(mdlName, path[CLJS], CLJS),
        _generateFile(mdlName, path[CSSS], CSSS),
        _generateFile(mdlName, path[VIEW], VIEW, path[FVIE])
      ]
    },
      //remove all file
      _destroyModule = isForce => mdlName => {
        const path = _getModuleInfo(mdlName);
        return [
          _destroyFile(path[CTRL], path[FCTR], isForce),
          _destroyFile(path[MODE], path[FMOD], isForce),
          _destroyFile(path[ROUT], path[FROU], isForce),
          _destroyFile(path[CLJS], '', isForce),
          _destroyFile(path[CSSS], '', isForce),
          _destroyFile(path[VIEW], path[FVIE], isForce)
        ]
      }

    //public only 2 main function
    return { _makeModule, _destroyModule };
  }
  return {
    getInstance: () => {
      if (!instance) instance = init();
      return instance;
    }
  }
})();

//|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\/|\
const anphTool = AnphTool.getInstance(),
  commander = require('commander'),
  FORCE = true;

commander
  .version('1.0.0', '-v, --version')
  .option('-c, --create [value]', 'create module by name', anphTool._makeModule)
  .option('-d, --destroy [value]', 'destroy module by name', anphTool._destroyModule(!FORCE))
  .option('-f, --forcedestroy [value]', 'force destroy module by name', anphTool._destroyModule(FORCE))
  .parse(process.argv);

!!commander.create && console.log(' -- CREATED DONE:\n\n\t%s\n', commander.create.join('\n\t'));
!!commander.destroy && console.log(' -- DESTROYED DONE:\n\n\t%s\n', commander.destroy.join('\n\t'));
!!commander.forcedestroy && console.log(' -- FORCE DESTROYED DONE:\n\n\t%s\n', commander.forcedestroy.join('\n\t'));

