/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 702:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 583:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 334:
/***/ ((module) => {

module.exports = eval("require")("lodash-es");


/***/ }),

/***/ 347:
/***/ ((module) => {

module.exports = `query($repo: String!, $owner: String!, $branch: String!) {
  repository(name: $repo, owner: $owner) {
    ref(qualifiedName: $branch) {
      target {
        ... on Commit {
          deployments(last: 1) {
            edges {
              node {
                latestStatus {
                  environmentUrl
                }
              }
            }
          }
        }
      }
    }
  }
  rateLimit {
    cost
    limit
    nodeCount
    remaining
    resetAt
  }
}
`

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__nccwpck_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__nccwpck_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(702);
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__nccwpck_require__.n(_actions_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _actions_github__WEBPACK_IMPORTED_MODULE_1__ = __nccwpck_require__(583);
/* harmony import */ var _actions_github__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__nccwpck_require__.n(_actions_github__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_es__WEBPACK_IMPORTED_MODULE_2__ = __nccwpck_require__(334);
/* harmony import */ var lodash_es__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__nccwpck_require__.n(lodash_es__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _query_gql__WEBPACK_IMPORTED_MODULE_3__ = __nccwpck_require__(347);
/* harmony import */ var _query_gql__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__nccwpck_require__.n(_query_gql__WEBPACK_IMPORTED_MODULE_3__);





async function getDeployment(args, retryInterval) {
  let environment = null;
  while (!environment) {
    environment = await tryGetResult(args);
    if (!environment)
      console.log(
        `environment is null, waiting ${retryInterval} milliseconds and trying again`
      );
    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }
  return environment;
}

async function tryGetResult(args) {
  const octokit = (0,_actions_github__WEBPACK_IMPORTED_MODULE_1__.getOctokit)((0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput)("token", { required: true }));
  const result = await octokit.graphql((_query_gql__WEBPACK_IMPORTED_MODULE_3___default()), args);
  await waitForRateLimitReset(result);

  const edges = (0,lodash_es__WEBPACK_IMPORTED_MODULE_2__.get)(result, "repository.ref.target.deployments.edges");
  if (!edges) return null;
  return (0,lodash_es__WEBPACK_IMPORTED_MODULE_2__.get)(edges, `[0].node.latestStatus.environmentUrl`, null);
}

async function waitForRateLimitReset(result) {
  const { cost, remaining, resetAt } = result.rateLimit;
  if (remaining >= cost) return;

  const timeToRateLimitReset =
    new Date(resetAt).getTime() - new Date().getTime();
  await new Promise((resolve) => setTimeout(resolve, timeToRateLimitReset));
}

async function run() {
  try {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    const branch =
      process.env.GITHUB_HEAD_REF ||
      process.env.GITHUB_REF.match(/(?<=refs\/heads\/).+/g)[0];
    const retryInterval = Number((0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput)("retryInterval"));

    const args = { repo, owner, branch };
    console.log("Starting to run with following input:", args);

    const deployment = await getDeployment(args, retryInterval);

    console.log(deployment)
    
    ;(0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.setOutput)("deployment", deployment);
    console.log("Deployment set: ", JSON.stringify(deployment));
  } catch (error) {
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.setFailed)(error.message);
  }
}

run();

})();

module.exports = __webpack_exports__;
/******/ })()
;