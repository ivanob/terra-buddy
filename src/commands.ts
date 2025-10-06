import { fetchTemplate, writeFilesSync } from "./utils"

export const initProject = () => {
    const mainFile = fetchTemplate("main.tf.eta");
    writeFilesSync('infra/', { 'main.tf': mainFile });
}