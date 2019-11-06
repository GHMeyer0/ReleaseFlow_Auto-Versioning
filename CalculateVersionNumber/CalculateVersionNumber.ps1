function RunTask {
    
}

# Variaveis para Teste do Script
# $Env:BUILD_SOURCEBRANCH = "refs/heads/release/1.1"
# $Env:BUILD_SOURCEBRANCH = "refs/heads/master"
# git config --global user.email "azuredevops@microsoft.com"
# git config --global user.name "Azure DevOps"
function Get-LastPatch {
    param (
        [System.Collections.ArrayList] $tags
    )
    $patchs = @()
    foreach ($tag in $tags) {
                                            
        $tag = [string]$tag.Split(".")[2]
        if ($tag -like "*-beta") {
            $tag = [string]$tag.Split("-")[0]
        }
        $patchs += [int]$tag
    }
                                    
    $patchs = $patchs | Sort-Object
    return $patchs[$patchs.Count - 1]
}
                                
# Pegar Ultima Tag do Repositorio
$gitTags = git tag | Sort-Object 
                                            
if ($gitTags -is [System.Array]) {
    $tag = $gitTags[$gitTags.Count - 1]
}
else {
    $tag = $gitTags
}
                                
# Pegar valor de Major, Minor e tag de Versão da Tag
if ($tag.Contains("-")) {
    $tag = $tag.Split("-")[0]    
}
$major = [int]$tag.Split(".")[0]
$minor = [int]$tag.Split(".")[1]
if ( $Env:BUILD_SOURCEBRANCH.Split("/")[2] -like "master" -or $Env:BUILD_SOURCEBRANCH.Split("/")[2] -like "release" ) {
    $gitTags = git tag -l "$major.$minor.*" | Sort-Object
                                            
    switch ( $Env:BUILD_SOURCEBRANCH.Split("/")[2] ) {    
        "master" {
            if ($gitTags -like "*-beta") {
                $gitTags = $gitTags | Where-Object { $_ -like "*-beta" }
                $patch = Get-LastPatch($gitTags)                    
            }
            else {
                $patch = 0
            }
            $patch++
            $versionTag = "-beta"
        }
        "release" { 
            if ($Env:BUILD_SOURCEBRANCH.Split("/")[3] -eq "$major.$minor") {
                $gitTags = $gitTags | Where-Object { $_ -notlike "*-beta" }
                $patch = Get-LastPatch($gitTags)
                $patch++
            }
            else {
                $minor++
                $patch = 0
            }
            $versionTag = ""
        }
    }
    Write-Host "##vso[build.updatebuildnumber]$major.$minor.$patch$versionTag"
}