/**
 * These are all the utilities to manage the tf files: read values, add new resources, etc.
 */

export const isS3Initialised = (): boolean => {
    //Chec if the folder s3 exists in infra
    return false;
}

export const addNewS3Bucket = (bucketName: string, region: string) => {
    if(!isS3Initialised()){
        
    }

}

export const isProjectInitialized = (): boolean => {
    //Check if the infra folder exists
    return true;
}

export const getProjectCodename = (): string => {
    return "tri2";
}

export const getProjectName = (): string => {
    return "long name of the project";
}