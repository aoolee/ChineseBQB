const fs = require("fs");
const path = require("path");
const moment = require('moment');


// 可以配置
const user_name = "aoolee";
const repo_name = "ChineseBQB";
const N = "\n";

// 根据BQB结尾的文件夹自动生成模板文件
async function create_bqb_md(){

    return new Promise((resolve, reject)=>{
        let file_list = fs.readdirSync(path.join(__dirname, "./"));
        let md_dir_list = [];
        file_list.map((file_name_value, file_name_index)=>{
            if(file_name_value.endsWith("BQB")){
                md_dir_list.push(file_name_value);
            }
        });
        console.log("md_dir_list::", md_dir_list);
        // 如果对应的md文件已经存在则略过, 如果不存在,则创建一个

        for (let i = 0; i<md_dir_list.length; i++){
            let tmp_md_path = "./source/_posts/"+md_dir_list[i]+".md";
            fs.access(tmp_md_path, function(err){
                if(err){

                    let top = md_dir_list[i].slice(0, 3);

                    top = 1000 - parseInt(top);

                    if(isNaN(top) === true){
                        top = 0;
                    }
                    console.log("top::", top);
                    // 构建内容
                    let content = `---${
                    "\n"}title: ${md_dir_list[i]}${
                    "\n"}top: ${top}${
                    "\n"}tags:${
                    "\n"}- ${md_dir_list[i]}${
                    "\n"}categories:${
                    "\n"}- ${md_dir_list[i]}${
                    "\n"}${
                    "\n"}---${
                    "\n"}${
                    "\n"}------${
                    "\n"}${
                    "\n"}<!-- more -->${
                    "\n"}`;
                    // 去创建文件
                    fs.writeFileSync(tmp_md_path, content);
                    console.log(tmp_md_path, "创建完成");
                    if(i === md_dir_list.length-1){
                        console.log("md文件已初始化完成");

                        resolve();

                    }

                }else{
                    console.log(tmp_md_path, "已经存在! 无需创建");
                    if(i === md_dir_list.length-1){
                        console.log("md文件已初始化完成");
                        resolve();
                    }
                }
            });


        }

    });





}


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

    console.log("images_len::", images.length);


    return images;


}

// 将images信息转换为md文本信息
function image_to_md_info(images){
    let all_md_info = "";
    images.map((image_info, image_index)=>{

        let md_info = "![]("+image_info+")\n"+"###### 下载地址:"+"["+image_info+"]("+image_info+")\n\n";
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



    let new_md_info = old_md_info.replace(old_content, new_content);


    await fs.writeFileSync(file_path, new_md_info);

    console.log(file_path, "文件生成成功");

    return new_md_info;


}

// 处理readme
class ReadmeContents{
    constructor(){
        this.state={
            readme_contents_info: []
        };
        this.push_readme_contents_info = this.push_readme_contents_info.bind(this);
        this.get_readme_contents_info = this.get_readme_contents_info.bind(this);
        this.create_readme_content_md = this.create_readme_content_md.bind(this);
        this.update_readme = this.update_readme.bind(this);
    }

    // 为目录数组增加元素
    push_readme_contents_info(ele){
        this.state.readme_contents_info.push(ele);
        return this.state.readme_contents_info;
    }

    // 获取目录数组
    get_readme_contents_info(){
        return this.state.readme_contents_info;
    }

    create_readme_content_md(){
        // 统计所有图片的数量
        let all_images_number = 0;
        for(let i = 0; i<this.state.readme_contents_info.length; i++){
            all_images_number += this.state.readme_contents_info[i]["images_number"];
        }

        // 定义标题

        let title =  `表情包目录(共收录${all_images_number}张表情包)Emoticon package directory (commonly included ${all_images_number} emoticon pack)`;

        // 定义标题行

        let title_row = `${
            "\n"}| Example(示例)  |  链接(Entrance link)  | ${
            "\n"}| :---: | :---: |${
            "\n"}`;

        // 定义单行数据  图片样式/链接样式
        let all_row_data = "";
        let tmp_dir_name = "";

        for(let n = 0; n<this.state.readme_contents_info.length; n++){
            let dir_name = [...(this.state.readme_contents_info[n].readme_contents_info_href.split("/"))].reverse()[1];
            console.log(dir_name);
            let data_row = `| <img height='100px' style='height:100px;' src=${this.state.readme_contents_info[n].readme_contents_info_img} /> | [${dir_name}(已收录${this.state.readme_contents_info[n].images_number}张)](${this.state.readme_contents_info[n].readme_contents_info_href}) |${"\n"}`;

            all_row_data+=data_row;


        }


        // 生成数据生成时间

        let now_date = moment(new Date()).format("YYYY-MM-DD");

        let now_date_desc = `> 数据生成时间: ${now_date}${"\n"}${"\n"}`;


        // 拼接

        let all_table_data = title+title_row+all_row_data+now_date_desc;


        // 返回

        console.log("all_table_data::", all_table_data);

        return all_table_data;

    }

    // 更新readme信息
    async update_readme(){

        // 获取README中需要被替换的部分
        let readme_content = fs.readFileSync("./README.md").toString();
        let start_index = readme_content.indexOf("表情包目录");
        let end_index = readme_content.indexOf("BQBEND");
        let old_content = readme_content.slice(start_index, end_index);

        // 生成新的内容


        // 获取生成的数据
        let new_content = this.create_readme_content_md();

        // 替换内容
        readme_content = readme_content.replace(old_content, new_content);



        await fs.writeFileSync("./README.md", readme_content);

        console.log("README生成成功");

    }
}


async function main(){

    // 初始化md文件
    await create_bqb_md();

    let md_name_list = get_bqb_md_name_list();

    let readme_contents_obj = new ReadmeContents();


    await md_name_list.map(async (md_name_value, md_name_index)=> {
        // 初始化当前目录信息
        let readme_contents_info_obj = {
            readme_contents_info_img: "",
            readme_contents_info_href: "",
            images_number:0
        };

       let images = await get_images_src(md_name_value);
       readme_contents_info_obj.images_number = images.length;
       // 通过images生成md文本
       let md_info = image_to_md_info(images);
       // 将images信息转换为md信息, 并写入md文件
       await md_info_replace_more_info(md_name_value, md_info);
       // 目录索引图获取: 获取以0命名的图片信息,写入readme_contents_info_obj.readme_contents_info_obj


        for (let i = 0; i<images.length; i++){
            let file_name = [...(images[i].split("/"))].pop();
            if(file_name.startsWith("0.")){
                readme_contents_info_obj.readme_contents_info_img = images[i];
            }
            // 如果没有以0.命名的图片, 则按照默认排序, 取第一张
            if((i === images.length-1)&&(file_name.startsWith("0.")===false)){
                readme_contents_info_obj.readme_contents_info_img = images[0];
            }

        }




        // 页面链接获取
        let dir_name = md_name_value.slice(0, md_name_value.length-3);

        let readme_contents_info_href = "https://"+ user_name +".github.io/" +repo_name + "/"+dir_name+"/";
        readme_contents_info_obj.readme_contents_info_href = readme_contents_info_href;


        readme_contents_obj.push_readme_contents_info(readme_contents_info_obj);

        if(md_name_index === md_name_list.length-1){
            readme_contents_obj.update_readme();

        }


    });




}


main();