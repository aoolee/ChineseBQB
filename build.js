const fs = require("fs");
const path = require("path");
const axios = require('axios');


// 可以配置
const user_name = "zhaoolee";
const repo_name = "ChineseBQB";


// 读取_posts下面已BQB.md结尾的文件
function get_bqb_md_name_list(){
    let file_list = fs.readdirSync(path.join(__dirname, "./source/_posts/"));
    let md_list = [];
    file_list.map((file_name_value, file_name_index)=>{
        if(file_name_value.endsWith(".md")){
            md_list.push(file_name_value);
        }
    });
    // console.log("md_list::", md_list);
    return md_list;
}

// 读取表情包目录下的图片, 并拼接出图片未来的url
function get_images_src(md_name){

    let dir_name = md_name.slice(0, md_name.length-3);
    files  = fs.readdirSync(path.join(__dirname, "./"+dir_name));
    images = [];
    files.map((file_name, file_index)=> {
        if(file_name.endsWith(".jpg")||file_name.endsWith(".gif")||file_name.endsWith(".png")||file_name.endsWith(".JPG")||file_name.endsWith(".GIF")||file_name.endsWith(".PNG")||file_name.endsWith(".webp")){
            let image_src = "https://raw.githubusercontent.com/"+user_name+"/"+repo_name+"/master/"+ dir_name+"/"+file_name;
            images.push(image_src);
        }
    });

    // console.log("images::", images);

    return images;


}

// 将images信息转换为md文本信息
function image_to_md_info(images){
    let all_md_info = "";
    images.map((image_info, image_index)=>{

        let md_info = "![]("+image_info+")\n"+"下载地址:"+"[]("+image_info+")\n\n";
        all_md_info = all_md_info+md_info;
    });
    // console.log("all_md_info:", all_md_info);
    return all_md_info;
}

// 将md_info 追加到 对应文件的 <!-- more --> 之后
async function md_info_replace_more_info(md_name_value, md_info){

    // file_path
    let file_path = path.join(__dirname,  "./source/_posts/"+md_name_value);

    // 原有的md_info
    let old_md_info = fs.readFileSync(file_path).toString();

    // 需要替换的md_info
    let replace_md_info = "<!-- more -->\n" + md_info;

    // 新的md_info
    let start_index = old_md_info.indexOf("<!-- more -->");
    let end_index = old_md_info.length;

    let old_content = old_md_info.slice(start_index, end_index);
    let new_content = "<!-- more -->\n\n" + md_info;


    // console.log("old_content:", old_content);
    // console.log("new_content:", new_content);

    let new_md_info = old_md_info.replace(old_content, new_content);

    // console.log("新的文件内容为::", new_md_info);

    await fs.writeFileSync(file_path, new_md_info);

    console.log(file_path, "文件生成成功");

    return new_md_info;


}


async function main(){

    let md_name_list = get_bqb_md_name_list();

    let readme_info = [];

    await md_name_list.map(async (md_name_value, md_name_index)=> {
       images = await get_images_src(md_name_value);
       // 通过images生成md文本
       let md_info = image_to_md_info(images);
       // 将images信息转换为md信息, 并写入md文件
       await md_info_replace_more_info(md_name_value, md_info);
       //
    });



}


main();