/**
 * Created by Jeremie on 2018/05/08.
 */
import * as _ from "lodash";
import * as fs from 'fs';
import * as XRegexp from 'xregexp';

enum InfoType {
    A = "吉", B = "吉带凶", C = "凶带吉", D = "凶"
}

enum InfoTypeResolve {
    A1 = "大吉",
    A2 = "中吉",
    A3 = "小吉",
    B = "吉带凶",
    C = "凶带吉",
    D3 = "小凶",
    D2 = "中凶",
    D1 = "大凶",
    Z = "Unknown",
}

const ITR = InfoTypeResolve;
type ITR = InfoTypeResolve;

class Info {
    public num: number;
    public type: string;
    public info: string;
    public typeEnum: InfoType;
    public typeResolve: InfoTypeResolve;
    public typeLevel: number;

    constructor(num: number, info: string, type: string, typeResolve?: InfoTypeResolve) {
        this.num = num;
        this.info = info;
        this.type = type;
        switch (type) {
            case "吉":
                this.typeEnum = InfoType.A;
                break;
            case "吉带凶":
                this.typeEnum = InfoType.B;
                break;
            case "凶带吉":
                this.typeEnum = InfoType.C;
                break;
            case "凶":
                this.typeEnum = InfoType.D;
                break;
        }
        this.typeResolve = typeResolve || InfoTypeResolve.Z;
        if (this.typeResolve === InfoTypeResolve.Z) {
            switch (this.typeEnum) {
                case InfoType.A:
                    this.typeLevel = 11;
                    break;
                case InfoType.B:
                    this.typeLevel = 12;
                    break;
                case InfoType.C:
                    this.typeLevel = 13;
                    break;
                case InfoType.D:
                    this.typeLevel = 14;
                    break;
                default:
            }
        } else {
            switch (this.typeResolve) {
                case InfoTypeResolve.A1:
                    this.typeLevel = 1;
                    break;
                case InfoTypeResolve.A2:
                    this.typeLevel = 2;
                    break;
                case InfoTypeResolve.A3:
                    this.typeLevel = 3;
                    break;
                default:
            }
        }
    }
}

const lookupTable: Map<number, Info> = new Map<number, Info>([
    [0, new Info(0, "得而复失,枉费心机,守成无贪,可保安稳", "吉带凶",),],
    [1, new Info(1, "大展鸿图,信用得固,无远弗界,可获成功", "吉", ITR.A1),],
    [2, new Info(2, "根基不固,摇摇欲坠,一盛一衰,劳而无功", "凶",),],
    [3, new Info(3, "根深蒂固,蒸蒸日上,如意吉祥,百事顺遂", "吉", ITR.A1),],
    [4, new Info(4, "坎坷前途,苦难折磨,非有毅力,难望成功", "凶",),],
    [5, new Info(5, "阴阳和合,生意欣荣,名利双收,后福重重", "吉", ITR.A1),],
    [6, new Info(6, "万宝云集,天降幸运,立志奋发,可成大功", "吉", ITR.A2),],
    [7, new Info(7, "专心经营,和气致祥,排除万难,必获成功", "吉", ITR.A3),],
    [8, new Info(8, "努力发达,贯彻志望,不忘进退,成功可期", "吉", ITR.A3),],
    [9, new Info(9, "虽抱奇才,有才无命,独营无力,财利无望", "凶",),],
    [10, new Info(10, "乌云遮月,暗淡无光,空费心力,徒劳无功", "凶",),],
    [11, new Info(11, "草木逢春,枯叶沾露,稳健着实,必得人望", "吉", ITR.A3),],
    [12, new Info(12, "薄弱无力,孤立无摇,外祥内苦,谋事难成", "凶",),],
    [13, new Info(13, "天赋吉运,能得人望,善用智慧,必获成功", "吉", ITR.A2),],
    [14, new Info(14, "忍得苦难,必有后福,是成是败,惟靠坚毅", "凶",),],
    [15, new Info(15, "谦恭做事,必得人和,大事成就,一定兴隆", "吉", ITR.A2),],
    [16, new Info(16, "能获众望,成就大业,名利双收,盟主四方", "吉", ITR.A1),],
    [17, new Info(17, "排除万难,有贵人助,把握时机,可得成功", "吉", ITR.A2),],
    [18, new Info(18, "经商做事,顺利昌隆,如能慎始,百事亨通", "吉", ITR.A2),],
    [19, new Info(19, "成功虽早,慎防空亏,内外不合,障碍重重", "凶",),],
    [20, new Info(20, "智高志大,历尽艰难,焦心忧劳,进退两难", "凶",),],
    [21, new Info(21, "专心经营,善用智慧,霜雪梅花,春来怒放", "吉", ITR.A2),],
    [22, new Info(22, "秋草逢霜,怀才不遇,忧愁怨苦,事不如意", "凶",),],
    [23, new Info(23, "旭日升天,名显四方,渐次进展,终成大业", "吉", ITR.A2),],
    [24, new Info(24, "锦绣前程,须靠自力,多用智谋,能奏大功", "吉", ITR.A2),],
    [25, new Info(25, "天时地利,再得人格,讲信修睦,即可成功", "吉", ITR.A2),],
    [26, new Info(26, "波澜起伏,千变万化,凌驾万难,必可成功", "凶",),],
    [27, new Info(27, "一成一败,一盛一衰,惟靠谨慎,可守成功", "凶带吉",),],
    [28, new Info(28, "鱼临旱地,难逃恶运,此数大凶,不如更名", "凶",),],
    [29, new Info(29, "如龙得云,青云直上,智谋奋进,才略奏功", "吉", ITR.A1),],
    [30, new Info(30, "吉凶参半,得失相伴,投机取巧,如赛一样", "凶",),],
    [31, new Info(31, "此数大吉,名利双收,渐进向上,大业成就", "吉", ITR.A1),],
    [32, new Info(32, "池中之龙,风云际会,一跃上天,成功可望", "吉", ITR.A1),],
    [33, new Info(33, "不可意气,善用智慧,如能慎始,必可昌隆", "吉", ITR.A3),],
    [34, new Info(34, "灾难不绝,难望成功,此数大凶,不如更名", "凶",),],
    [35, new Info(35, "中吉之数,进退保守,生意安稳,成就可期", "吉", ITR.A3),],
    [36, new Info(36, "波澜重迭,常陷穷困,动不如静,有才无命", "凶",),],
    [37, new Info(37, "逢凶化吉,吉人天相,风条雨顺,生意兴隆", "吉", ITR.A1),],
    [38, new Info(38, "名虽可得,利则难获,艺界发展,可望成功", "凶带吉",),],
    [39, new Info(39, "云开见月,虽有劳碌,光明坦途,指日可期", "吉", ITR.A3),],
    [40, new Info(40, "一胜一衰,浮沉不定,知难而退,自获天佑", "吉带凶",),],
    [41, new Info(41, "天赋吉运,德望兼备,继续努力,前途无限", "吉", ITR.A2),],
    [42, new Info(42, "事业不专,十九不成,专心进取,可望成功", "吉带凶",),],
    [43, new Info(43, "雨夜之花,外祥内苦,忍耐自重,转凶为吉", "吉带凶",),],
    [44, new Info(44, "虽用心计,事难遂愿,贪功好进,必招失败", "凶",),],
    [45, new Info(45, "杨柳遇春,绿叶发枝,冲破难关,一举成名", "吉", ITR.A1),],
    [46, new Info(46, "坎坷不平,艰难重重,若无耐心,难望有成", "凶",),],
    [47, new Info(47, "有贵人助,可成大业,虽遇不幸,浮沉不大", "吉", ITR.A2),],
    [48, new Info(48, "美化丰实,鹤立鸡群,名利俱全,繁荣富贵", "吉", ITR.A1),],
    [49, new Info(49, "遇吉则吉,遇凶则凶,惟靠谨慎,逢凶化吉", "凶",),],
    [50, new Info(50, "吉凶互见,一成一败,凶中有吉,吉中有凶", "吉带凶",),],
    [51, new Info(51, "一盛一衰,浮沉不常,自重自处,可保平安", "吉带凶",),],
    [52, new Info(52, "草木逢春,雨过天晴,渡过难关,即获成功", "吉", ITR.A2),],
    [53, new Info(53, "盛衰参半,外祥内苦,先吉后凶,先凶后吉", "吉带凶",),],
    [54, new Info(54, "虽倾全力,难望成功,此数大凶,最好改名", "凶",),],
    [55, new Info(55, "外观隆昌,内隐祸患,克服难关,开出泰运", "吉带凶",),],
    [56, new Info(56, "事与愿违,终难成功,欲速不达,有始有终", "凶",),],
    [57, new Info(57, "努力经营,时来运转,旷野枯草,春来花开", "吉", ITR.A3),],
    [58, new Info(58, "半凶半吉,浮沉多端,始凶终吉,能保成功", "凶带吉",),],
    [59, new Info(59, "遇事犹疑,难望成事,大刀阔斧,始可有成", "凶",),],
    [60, new Info(60, "黑暗无光,心迷意乱,出尔反尔,难定方针", "凶",),],
    [61, new Info(61, "云遮半月,百隐风波,应自谨慎,始保平安", "吉带凶",),],
    [62, new Info(62, "烦闷懊恼,事事难展,自防灾祸,始免困境", "凶",),],
    [63, new Info(63, "万物化育,繁荣之象,专心一意,始能成功", "吉", ITR.A2),],
    [64, new Info(64, "见异思迁,十九不成,徒劳无功,不如更名", "凶",),],
    [65, new Info(65, "吉运自来,能享盛名,把握机会,必获成功", "吉", ITR.A2),],
    [66, new Info(66, "黑夜漫长,进退维谷,内外不合,信用缺乏", "凶",),],
    [67, new Info(67, "时来运转,事事如意,功成名就,富贵自来", "吉", ITR.A1),],
    [68, new Info(68, "思虑周详,计划力行,不失先机,可望成功", "吉", ITR.A3),],
    [69, new Info(69, "动摇不安,常陷逆境,不得时运,难得利润", "凶",),],
    [70, new Info(70, "惨淡经营,难免贫困,此数不吉,最好改名", "凶",),],
    [71, new Info(71, "吉凶参半,惟赖勇气,贯彻力行,始可成功", "吉带凶",),],
    [72, new Info(72, "利害混集,凶多吉少,得而复失,难以安顺", "凶",),],
    [73, new Info(73, "安乐自来,自然吉祥,力行不懈,终必成功", "吉", ITR.A3),],
    [74, new Info(74, "利不及费,坐食山空,如无智谋,难望成功", "凶",),],
    [75, new Info(75, "吉中带凶,欲速不达,进不如守,可保安详", "吉带凶",),],
    [76, new Info(76, "此数大凶,破产之象,宜速改名,以避厄运", "凶",),],
    [77, new Info(77, "先苦后甘,先甘后苦,如能守成,不致失败", "吉带凶",),],
    [78, new Info(78, "有得有失,华而不实,须防劫财,始保平安", "吉带凶",),],
    [79, new Info(79, "如走夜路,前途无光,希望不大,劳而无功", "凶",),],
    [80, new Info(80, "得而复失,枉费心机,守成无贪,可保安稳", "吉带凶",),],
    [81, new Info(81, "最极之数,还本归元,能得繁业,发达成功", "吉",),],
]);

class Phone {
    constructor(
        public num: number,
        public price: number,) {

    }
}

let beTestList: Phone[] = [];


let s = fs.readFileSync('data.txt', 'utf-8');
// console.log(s);
XRegexp.install({astral: true});
XRegexp.forEach(s, XRegexp.cache('^\\s*(\\d+)\\s*¥\\s*(\\d+)\\s*$', 'gmuA'), (m, I) => {
    console.log(I, m);
    beTestList.push(new Phone(_.parseInt(m[1]), _.parseInt(m[2])));
});

// console.log(beTestList);


class OutputData {
    constructor(
        public index: number,
        public num: number,
        public price: number,
        public type: string,
        public typeEnum: InfoType,
        public typeLevel: number,
        public level: number,
        public info: string,
    ) {
    }
}

let outputDataList: OutputData[] = [];

beTestList.map((T, index) => {
    let n = lookupTable.get(T.num % 80);
    // if (n.typeEnum == InfoType.A)
    // console.log(index + "\t" + T.num + "\t¥" + T.price + "\t" + n.type + "\t" + n.num + "\t" + n.info);
    outputDataList.push(new OutputData(
        index,
        T.num,
        T.price,
        n.type,
        n.typeEnum,
        n.typeLevel,
        n.num,
        n.info
    ))
});


const outputIt = (fileName: string, _outputDataList: OutputData[]) => {
    let outS = "";

    _outputDataList.forEach(T => {
        // console.log(
        //     T.index
        //     + '\t' + T.num
        //     + '\t' + T.price
        //     + '\t' + T.type
        //     + '\t' + T.level
        //     + '\t' + T.info
        // );
        outS = outS + '\n' +
            T.index
            + '\t' + T.num
            + '\t' + T.price
            + '\t' + T.type
            + '\t' + T.level
            + '\t' + T.info;
    });

    fs.writeFileSync(fileName, outS, 'utf-8');

};


outputDataList = _.sortBy(outputDataList, ['level']);
// outputDataList.sort((a, b) => a.level - b.level);
outputIt('output1.txt', outputDataList);
outputDataList = _.sortBy(outputDataList, ['typeLevel', 'level',]);
// outputDataList.sort((a, b) => a.typeLevel - b.typeLevel);
outputIt('output2.txt', outputDataList);

outputDataList = _.filter(outputDataList, (T: OutputData) => T.typeLevel <= 11);
outputDataList = _.sortBy(outputDataList, ['level']);
outputIt('output3.txt', outputDataList);
outputDataList = _.filter(outputDataList, (T: OutputData) => T.typeLevel <= 11);
outputDataList = _.sortBy(outputDataList, ['typeLevel']);
outputIt('output4.txt', outputDataList);
