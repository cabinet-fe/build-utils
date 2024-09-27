import { $ } from 'bun'
import { writeFile } from 'fs/promises'
import { readFile } from 'fs/promises'
import inquirer from 'inquirer'
import pic from 'picocolors'

export async function updateVersion(pkgJSONPath: string) {
  const pkgJson = JSON.parse(await readFile(pkgJSONPath, 'utf-8'))
  const [major, minor, patch] = pkgJson.version
    .split('.')
    .map((v: string) => +v)
  const nextMajor = `${major + 1}.0.0`
  const nextMinor = `${major}.${minor + 1}.0`
  const nextPatch = `${major}.${minor}.${patch + 1}`
  const { targetVersion } = await inquirer.prompt<{
    targetVersion: string
  }>({
    type: 'select',
    message: `选择升级的版本, 当前 ${pic.blue(pkgJson.version)}`,
    name: 'targetVersion',
    choices: [
      { name: `主版本 ${nextMajor}`, value: nextMajor },
      { name: `次版本 ${nextMinor}`, value: nextMinor },
      { name: `修订版 ${nextPatch}`, value: nextPatch },
      { name: `不升级 ${pkgJson.version}`, value: pkgJson.version }
    ],
    default: nextPatch
  })
  pkgJson.version = targetVersion

  await writeFile(pkgJSONPath, JSON.stringify(pkgJson, null, 2), 'utf-8')

  const text =
    await $`git commit -m 'release: ${pkgJson.name}发布${targetVersion}版本' --allow-empty --all`.text(
      'utf8'
    )

  // 实现unicode转中文

  console.log(
    pic.green(
      text.replace(/\\u([0-9a-fA-F]{4})/g, (_, $1) =>
        String.fromCharCode(parseInt($1, 16))
      )
    )
  )

  await $`git push`
}
