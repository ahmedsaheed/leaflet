import createWindow from './create-window';
import {Notification} from 'electron'


export {
  createWindow,
  markdown
};


const markdown = `
# Leaflet

[[toc]]

<a href="http://wiki.xxiivv.com/Left" target="_blank"></a>Left is <b>distractionless plaintext editor</b> designed to quickly navigate between segments of an essay, or multiple documents. It features an auto-complete, synonyms suggestions, writing statistics, markup-based navigation and a speed-reader.
 $(ax^2 + bx + c = 0)$  
$$\\sqrt{3x-1}+(1+x)^2$$

The <a href="http://github.com/hundredrabbits/Left" target="_blank" rel="noreferrer" class="external ">application</a> was initially created to help Rek with the writing of the upcoming novel Wiktopher, and later made available as a free and <a href="https://github.com/hundredrabbits/Left" target="_blank" rel="noreferrer" class="external ">open source</a> software.
$$\\sqrt{3x-1}+(1+x)^2$$

Learn more by reading the <a href="https://100r.co/site/left.html" target="_blank" rel="noreferrer" class="external ">manual</a>, or have a look at a <a href="https://www.youtube.com/watch?v=QloUoqqhXGE" target="_blank" rel="noreferrer" class="external ">tutorial video</a>. If you need <b>help</b>, visit the <a href="https://hundredrabbits.itch.io/left/community" target="_blank" rel="noreferrer" class="external ">Community</a>.
- [ ] Mercury
- [x] Venus
- [x] Earth (Orbit/Moon)
- [x] Mars
$$\\left( \\sum_{k=1}^n a_k b_k \\right)^2 \\leq \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)$$
## Install & Run
بدلاً من الحب بدلاً من المال ، أعطني الحقيقة. هذا كل ما سأطلبه.

お金より愛より真実をください。それが私が求めるすべてです。

You can download [builds](https://hundredrabbits.itch.io/left) for **OSX, Windows and Linux**, or if you wish to build it yourself, follow these steps:
$$\\sqrt{3x-1}+(1+x)^2$$
Here's a simple footnote,[^1] and here's a longer one.[^bignote]
[^1]: This is the first footnote.
[^bignote]: Here's one with multiple paragraphs and code.
    Indent paragraphs to include them in the footnote.
    Add as many paragraphs as you like.
<img src='https://raw.githubusercontent.com/hundredrabbits/Left/master/PREVIEW.jpg' width="600"/>
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
---
## Media Support
<audio controls>
  <source src="https://olagist.net/wp-content/uploads/2020/09/J_Cole_-_Want_You_To_Fly_Javari_.mp3" 
   type="audio/mpeg">
Your browser does not support the audio element.
</audio>
## Extras
- This application supports the [Ecosystem Theme](https://github.com/hundredrabbits/Themes).
- Support this project through [Patreon](https://patreon.com/100).
- Left's source code is licensed under [MIT](https://github.com/hundredrabbits/Left/blob/master/LICENSE) and the **images, text and assets** are licensed under [BY-NC-SA 4.0](https://github.com/hundredrabbits/Left/blob/master/LICENSE.by-nc-sa-4.0.md). View individual licenses for details.
- Pull Requests are welcome!
`;
