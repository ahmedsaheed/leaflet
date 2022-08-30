import createWindow from './create-window';
import {Notification} from 'electron'


export {
  createWindow,
  markdown
};


// const markdown = `
// # Leaflet

// [[toc]]

// <a href="http://wiki.xxiivv.com/Left" target="_blank"></a>Left is <b>distractionless plaintext editor</b> designed to quickly navigate between segments of an essay, or multiple documents. It features an auto-complete, synonyms suggestions, writing statistics, markup-based navigation and a speed-reader.
//  $(ax^2 + bx + c = 0)$  
// $$\\sqrt{3x-1}+(1+x)^2$$

// The <a href="http://github.com/hundredrabbits/Left" target="_blank" rel="noreferrer" class="external ">application</a> was initially created to help Rek with the writing of the upcoming novel Wiktopher, and later made available as a free and <a href="https://github.com/hundredrabbits/Left" target="_blank" rel="noreferrer" class="external ">open source</a> software.
// $$\\sqrt{3x-1}+(1+x)^2$$

// Learn more by reading the <a href="https://100r.co/site/left.html" target="_blank" rel="noreferrer" class="external ">manual</a>, or have a look at a <a href="https://www.youtube.com/watch?v=QloUoqqhXGE" target="_blank" rel="noreferrer" class="external ">tutorial video</a>. If you need <b>help</b>, visit the <a href="https://hundredrabbits.itch.io/left/community" target="_blank" rel="noreferrer" class="external ">Community</a>.
// - [ ] Mercury
// - [x] Venus
// - [x] Earth (Orbit/Moon)
// - [x] Mars
// $$\\left( \\sum_{k=1}^n a_k b_k \\right)^2 \\leq \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)$$
// ## Install & Run
// بدلاً من الحب بدلاً من المال ، أعطني الحقيقة. هذا كل ما سأطلبه.

// お金より愛より真実をください。それが私が求めるすべてです。

// You can download [builds](https://hundredrabbits.itch.io/left) for **OSX, Windows and Linux**, or if you wish to build it yourself, follow these steps:
// $$\\sqrt{3x-1}+(1+x)^2$$
// Here's a simple footnote,[^1] and here's a longer one.[^bignote]
// [^1]: This is the first footnote.
// [^bignote]: Here's one with multiple paragraphs and code.
//     Indent paragraphs to include them in the footnote.
//     Add as many paragraphs as you like.
// <img src='https://raw.githubusercontent.com/hundredrabbits/Left/master/PREVIEW.jpg' width="600"/>
// \`\`\`go\n
// func threeSum(nums []int) [][]int {
//   res := [][]int{}
//   sort.Ints(nums)
//   for i := range nums {
//       if i > 0 && nums[i] == nums[i-1] {
//           continue
//       }
//       j, k := i+1, len(nums)-1
//       for j < k {
//           sum := nums[i] + nums[j] + nums[k]
//           switch {
//           case sum < 0:
//               j++
//           case sum > 0:
//               k--
//           default:
//               res = append(res, []int{nums[i], nums[j], nums[k]})
//               j, k = next(nums, j, k)
//           }
//       }
//   }
//   return res
// }
// func next(nums []int, i, j int) (int, int) {
//   for i < j {
//       switch {
//       case nums[i] == nums[i+1]:
//           i++
//       case nums[j] == nums[j-1]:
//           j--
//       default:
//           i++
//           j--
//       }
//   }
  
// \n\`\`\`
// ---

// | Tables   |      Are      |  Cool |
// |----------|:-------------:|------:|
// | col 1 is |  left-aligned | $1600 |
// | col 2 is |    centered   |   $12 |
// | col 3 is | right-aligned |    $1 |


// ## Media Support
// <audio controls>
//   <source src="https://olagist.net/wp-content/uploads/2020/09/J_Cole_-_Want_You_To_Fly_Javari_.mp3" 
//    type="audio/mpeg">
// Your browser does not support the audio element.
// </audio>
// ## Extras
// - This application supports the [Ecosystem Theme](https://github.com/hundredrabbits/Themes).
// - Support this project through [Patreon](https://patreon.com/100).
// - Left's source code is licensed under [MIT](https://github.com/hundredrabbits/Left/blob/master/LICENSE) and the **images, text and assets** are licensed under [BY-NC-SA 4.0](https://github.com/hundredrabbits/Left/blob/master/LICENSE.by-nc-sa-4.0.md). View individual licenses for details.
// - Pull Requests are welcome!
// `;


const markdown = `
# Leaflet

[[toc]]

<a href="http://wiki.xxiivv.com/Left" target="_blank"></a>

Leaflet a **minimal, distractionless markdown editor** designed to quickly navigate between multiple \`.md\` files in a directory. It features a clean mathematical typesetting, chemical equation rendering, code blocks highlighting, writing statistics and a speed-reader.


I created this <a href="http://github.com/ahmedsaheed/Leafler" target="_blank" rel="noreferrer" class="external ">application</a> to help me cope with note taking during lectures because most of my  lecturers spoke too fast. This application is made available as a free and <a href="https://github.com/hundredrabbits/Left" target="_blank" rel="noreferrer" class="external ">open source</a> software.

## Features

- **🖋 Editing**: Switch Between Edit and Preview Mode seamlessly.

- **⚛️ Maths & Chemical Equation Typesetting**: Leaflet renders mathematical, physics and chemical equation out of the box.

- **📄 Uses Files**: Leaflet works with users file system directly instead of an external database.

- **🌙 Dark / Light Mode**: Supports your system specified theme.

- **✨ Simplicity**: Leaflet focuses on simplicity and provides only necessary features needed.

- **Bidirectional Text**: Automatically detect BIDI - text and displays logiaclly.

## Installation

You can run Leaflet locally from the command line:

\`\`\`bash\n
$ git clone https://github.com/ahmedsaheed/Leaflet.git && cd Leaflet
$ yarn install
$ yarn dev
\n\`\`\`

## Screenshots


## More Features

- Support media like \`mp3\`, \`iframe\` and \`video\`. 
- Displays a table of content on demand
- Renders task list, tables and footnotes  quite nicely 
- File statistics displayed in the footer (speed-reader, word count, date).



## Examples

- Maths:

$$\\left( \\sum_{k=1}^n a_k b_k \\right)^2 \\leq \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)$$

- Chemical Equation:
$$H_2 + O_2 = H_2O$$

- Code Blocks:
\`\`\`go\n
func threeSum(nums []int) [][]int {
  res := [][]int{}
  sort.Ints(nums)
  for i := range nums {
      if i > 0 && nums[i] == nums[i-1] {
          continue
      }
      j, k := i+1, len(nums)-1
      for j < k {
          sum := nums[i] + nums[j] + nums[k]
          switch {
          case sum < 0:
              j++
          case sum > 0:
              k--
          default:
              res = append(res, []int{nums[i], nums[j], nums[k]})
              j, k = next(nums, j, k)
          }
      }
  }
  return res
}
func next(nums []int, i, j int) (int, int) {
  for i < j {
      switch {
      case nums[i] == nums[i+1]:
          i++
      case nums[j] == nums[j-1]:
          j--
      default:
          i++
          j--
      }
  }
  
\n\`\`\`


- Tables:

| Tables   |      Are      |  Cool |
|----------|:-------------:|------:|
| col 1 is |  left-aligned | $1600 |
| col 2 is |    centered   |   $12 |
| col 3 is | right-aligned |    $1 |

- Footnotes:

Here's a simple footnote,[^1] and here's a longer one.[^bignote]
[^1]: This is the first footnote.
[^bignote]: Here's one with multiple paragraphs and code.
    Indent paragraphs to include them in the footnote.
    Add as many paragraphs as you like.

- Media Support

This is an iframe

<iframe width="500" height="315" src="https://www.youtube.com/embed/6cRctjPRv6M" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>

- BIDI Support

الحب بدلاً من المال ، أعطني الحقيقة. هذا كل ما سأطلبه .

 お金より愛より真実をください。それが私が求めるすべてです。


## Extras
- [Leaflet] is strongly inspired by [Left](https://github.com/hundredrabbits/left) and [Opus](https://github.com/pacocoursey/Opus).
- Leaflet source code  licensed under [BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
- Pull Requests are welcome!
`;