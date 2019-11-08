import tl = require('azure-pipelines-task-lib/task');
async function run() {
    try {
        let tags: any;
        let newVersion: string;
        let lastVersion: string;
        let currentVersion: any;
        let branchName: string;
        let branchVersion: string;

        tags = getGitTags()
        lastVersion = filterLastVersion(tags).split(".");
        branchName = getBranchName()


        if (branchName.includes("release/")) {
            branchVersion = branchName.split("/")[1]
            branchName = branchName.split("/")[0]
        }

        switch (branchName) {
            case "master":
                currentVersion = filterLastVersion(tags, "-beta");
                if (currentVersion) {
                    currentVersion = currentVersion.split("-")[0].split(".");
                }
                if (lastVersion[0] == currentVersion[0] && lastVersion[1] == currentVersion[1]) {
                    newVersion = `${currentVersion[0]}.${currentVersion[1]}.${parseInt(currentVersion[2]) + 1}-beta`;
                }
                else {
                    newVersion = `${lastVersion[0]}.${lastVersion[1]}.1-beta`;
                }
                break;
            case "release":
                if (branchVersion == `${lastVersion[0]}.${lastVersion[1]}`) {
                    newVersion = `${lastVersion[0]}.${lastVersion[1]}.${parseInt(lastVersion[2]) + 1}`;
                } else {
                    newVersion = `${branchVersion}.0`
                }
                break;
        }
        console.log(`${newVersion}`)
        tl.updateBuildNumber(`${newVersion}`)   
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}
function filterLastVersion(tags: any[], _betaSulfix = "") {
    let major = [];
    let minor = [];
    let patch = [];

    if (_betaSulfix) {
        tags = tags.filter((value) => {
            return (value.endsWith(_betaSulfix));
        });
    } else {
        tags = tags.filter((value) => {
            return (!value.endsWith("-beta"));
        });
    }
    
    tags.forEach(tag => {
        major.push(+tag.split(".")[0])
    });
    major.sort((a, b) => b - a);

    tags = tags.filter((value) => {
        return (value.startsWith(`${major[0]}.`));
    });

    tags.forEach(tag => {
        minor.push(+tag.split(".")[1])

    });
    minor.sort((a,b)=> b-a);

    tags = tags.filter((value) => {
        return (value.startsWith(`${major[0]}.${minor[0]}`));
    });
    tags.sort((a, b) => b - a);

    tags.forEach(tag => {
        let _patch: string
        _patch = tag
        if (_betaSulfix) {
            _patch = tag.split("-")[0]
        }
        patch.push(+_patch.split(".")[2])

    });
    patch.sort((a, b) => b - a);
    tags = tags.filter((value) => {
        return (value.startsWith(`${major[0]}.${minor[0]}.${patch[0]}`) && value.endsWith(_betaSulfix));
    });

    return tags[0];
}

function getGitTags() {
    let tags: any;
    tags = tl.execSync('git', 'tag')
    tags = tags.stdout.split('\n')
    tags.pop()
    return tags
}
function getBranchName() {
    let branch: any;
    branch = tl.execSync('git', 'rev-parse --abbrev-ref HEAD')
    branch = branch.stdout.split('\n')
    branch.pop()
    return branch[0]
}
run();