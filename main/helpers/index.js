import createWindow from './create-window';


export {
  createWindow,
  markdown
};


const markdown = `---
title: Your Title
author: 
 - John Doe
 - Jane Doe
date: ${new Date().toLocaleDateString()}
tags:
 - note
 - markdown
 - minimal
material:
 - {source: 'https://github.com/ahmedsaheed/leaflet'} 
 - {shortcuts: 'https://github.com/ahmedsaheed/Leaflet#shortcuts-and-controls'}
 - {xala: 'https://github.com/'}   
---

---

<br>

## LEAFLET
A minimal distractionless markdown editor designed to quickly navigate between multiple \`.md\` files in a directory and its sub directories. It features a clean mathematical typesetting, chemical equation rendering, code blocks highlighting, writing statistics and a scroll indicator.

<div style="background-color:rgba(255,145,0,0.1); vertical-align: middle; margin:1em 0;border:1px color: inherit; border-radius: 5px;">
<details style="padding: 10px">
<summary style="cursor: pointer;color:#ff9100 !important;font-weight: 600;"> Why Leafet ? </summary>
<p style="margin: 1em 1em;">
We use software because we have goals to achieve and things to do. These softwares are prefabricated units developed by professionals for the masses, with few opportunities for customization. Sometimes the goals of these software overlap with ours, over time they diverge, introducing features we don't use or understand. I've  deeply tailor leaflet to meet my minimal unique
note taking needs. This application is made available as a free and <a href="https://github.com/ahmedsaheed/Leaflet" target="_blank" rel="noreferrer" class="external ">open sourced</a> software.
</p>
</details>
</div>

---
## Features

- **Editing**: Switch between editing and preview mode seemlessly

- **Maths & Chemical Equation Typesetting**: Leaflet renders mathematical, physics and chemical equation out of the box.

- **Pandoc Support**: Easily export your \`.md\` files to \`.pdf\` and \`.docx\` files

- **Suggested Words**: Leaflet has a dictionary of about 5000 words and recommends synonyms.

- **Offline First**: Leaflet works with your local file system directly instead of any external server.

- **Dark & Light Mode**: Supports your system specified theme.

- **Simplicity**: Leaflet focuses on simplicity and provides only necessary features needed.


- **Bidirectional Text**: Automatically detect BIDI - text and displays logiaclly.
---
## Shortcuts and Controls
### General
| Keys   |      Events      |
|----------|:-------------:|
| <kbd>⌘ / Ctrl</kbd> + <kbd>n</kbd> |  New File |
| <kbd>⌘ / Ctrl</kbd> + <kbd>s</kbd> |  Save File |
| <kbd>⌘ / Ctrl</kbd> + <kbd>o</kbd> |  Open File |
| <kbd>⌘ / Ctrl</kbd> + <kbd>i</kbd> |  Insert Mode |
| <kbd>⌘ / Ctrl</kbd> + <kbd>p</kbd> |  Preview Mode |
| <kbd>⌘ / Ctrl</kbd> + <kbd>d</kbd> |  Convert to Docx |
| <kbd>⌘ / Ctrl</kbd> + <kbd>e</kbd> |  Convert to PDF  |



### Quick Insert
| Keys   |      Events      |
|----------|:-------------:|
| <kbd>⌘ / Ctrl</kbd> + <kbd>[</kbd> |  Insert URL |
| <kbd>⌘ / Ctrl</kbd> + <kbd>y</kbd> |  Insert Date |
| <kbd>⌘ / Ctrl</kbd> + <kbd>t</kbd> |  Insert Time |
| <kbd>⌘ / Ctrl</kbd> + <kbd>/</kbd> |  Comment Selected |


---
## Examples

- Maths:

$$\\left( \\sum_{k=1}^n a_k b_k \\right)^2 \\leq \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)$$

- Chemical Equation:
$$H_2 + O_2 = H_2O$$

- Code Blocks:
\`\`\`rust\n
use std::collections::HashMap;

fn two_sum( arr: &[i32], target_sum: i32 ) -> Vec<i32> {
    let mut hash = HashMap::new();

    for i in 0..arr.len() {
        let j = target_sum - arr[i];
        if hash.contains_key(&j) {
            return vec![arr[i],j];
        }
        hash.insert(arr[i],1);
    }
    vec![]
}

fn main() {
    let arr = vec![ -1, 4, 5, 7, 2];
    let target_sum: i32 = 7;
    
    let result: Vec<i32> = two_sum(&arr, target_sum);
    println!("Result : {:?}", result);
}
  
\n\`\`\`


## More Features

- Support media like \`mp3\`, \`iframe\` and \`video\` 
- Displays a table of content on demand
- Renders task list, tables and footnotes  quite nicely 
- File statistics displayed in the footer (speed-reader, word count, date).

## Extras

- Leaflet is strongly inspired by [Left](https://github.com/hundredrabbits/left) and [Opus](https://github.com/pacocoursey/Opus).
- Leaflet source code  licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
- [Pull Requests](https://github.com/ahmedsaheed/Leaflet/compare) are welcomed!


`;


