git config --global user.email "azuredevops@microsoft.com"
git config --global user.name "Azure DevOps"
git tag -a "$Env:BUILD_BUILDNUMBER" -m " Build: $Env:BUILD_BUILDNUMBER \n Ultimo commit: $Env:BUILD_SOURCEVERSION"
git push origin --tags