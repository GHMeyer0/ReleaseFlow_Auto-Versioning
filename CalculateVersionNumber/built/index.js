"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
const fs = require("fs");
const git = require("isomorphic-git");
const branch = require("git-branch");
git.plugins.set('fs', fs);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let tags = yield git.listTags({ dir: '.' });
            let tag;
            let newVersion;
            let lastVersion;
            let currentVersion;
            let branchName = branch.sync();
            let branchVersion;
            lastVersion = filterLastVersion(tags).split(".");
            if (branchName.includes("release/")) {
                branchVersion = branchName.split("/")[1];
                branchName = branchName.split("/")[0];
            }
            switch (branchName) {
                case "master":
                    currentVersion = filterLastVersion(tags, "-beta");
                    if (currentVersion) {
                        currentVersion = tag.split("-")[0].split(".");
                    }
                    if (lastVersion[0] == currentVersion[0] && lastVersion[1] == currentVersion[1]) {
                        newVersion = `${currentVersion[0]}.${currentVersion[1]}.${parseInt(currentVersion[2]) + 1}-beta`;
                    }
                    else {
                        newVersion = `${lastVersion[0]}.${lastVersion[1]}.1-beta`;
                    }
                    console.log(newVersion);
                    break;
                case "release":
                    if (branchVersion == `${lastVersion[0]}.${lastVersion[1]}`) {
                        newVersion = `${lastVersion[0]}.${lastVersion[1]}.${parseInt(lastVersion[2]) + 1}`;
                    }
                    else {
                        newVersion = `${}`;
                    }
                    break;
            }
            tl.execSync("git", `tag ${newVersion} -m 'AA'`);
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
function filterLastVersion(tags, _betaSulfix = "") {
    let major = [];
    let minor = [];
    let patch = [];
    if (_betaSulfix) {
        tags = tags.filter((value) => {
            return (value.endsWith(_betaSulfix));
        });
    }
    else {
        tags = tags.filter((value) => {
            return (!value.endsWith("-beta"));
        });
    }
    tags.forEach(tag => {
        major.push(+tag.split(".")[0]);
    });
    major.sort((a, b) => b - a);
    tags = tags.filter((value) => {
        return (value.startsWith(`${major[0]}.`));
    });
    tags.forEach(tag => {
        minor.push(+tag.split(".")[1]);
    });
    minor.sort((a, b) => b - a);
    tags = tags.filter((value) => {
        return (value.startsWith(`${major[0]}.${minor[0]}`));
    });
    tags.sort((a, b) => b - a);
    tags.forEach(tag => {
        let _patch;
        _patch = tag;
        if (_betaSulfix) {
            _patch = tag.split("-")[0];
        }
        patch.push(+_patch.split(".")[2]);
    });
    patch.sort((a, b) => b - a);
    tags = tags.filter((value) => {
        return (value.startsWith(`${major[0]}.${minor[0]}.${patch[0]}`) && value.endsWith(_betaSulfix));
    });
    return tags[0];
}
run();
//# sourceMappingURL=index.js.map