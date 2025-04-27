/**
 * Landscapes page JavaScript
 * Handles category selection and gallery display with automatic orientation detection
 */

// Landscape image categories and data
const landscapeCategories = {
    'flowers': [
        {
            src: 'images/landscapes/flowers/000005050030l1.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/000005050031.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/000013050031l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/000013050032l1.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/000013050033.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/05010013.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/05010021.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/05010023.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/05010025.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/05010027.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/05010029.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/05010031.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/05010034l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/05020001l1.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/52220009l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65430006l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65430009.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65430011l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65430016l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65430018l1.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65430019.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65430020l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65430023l1.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65430027l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65430029.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65430030l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440003l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440009l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440011l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440015.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440017l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440018l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440019l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440020l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440021l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440022l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440023l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440024l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440025l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440028.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440029l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440031l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440032.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/65440033.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/e__2827_29.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/e__2834_29.JPG',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/F1010002l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/F1010003l__281_29.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        },
        {
            src: 'images/landscapes/flowers/F1010004l.jpg',
            alt: 'Flowers',
            caption: 'Flower Study'
        }
    ],
    'old': [
        {
            src: 'images/landscapes/old/00830016albw.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/033_3Al.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/16770012con2.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/16780010con.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/16780020conal.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/16790027con.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/16810006al.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/16810025con.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/16810035conal.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/20080001al.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/20080008al.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/20080032.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/20090006.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/20090009l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/20090018l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/20520022.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/20520028l.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/20520035.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/20570010l.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/20570031c3.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/20570034al.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/20800024lc2.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/20810020l.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/21220002l.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/21220007.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/21220008l.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/21220015.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/21220022.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/21220023.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/21310024.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/21330002.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/21330035l2.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/21330038l.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/21340002l.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/21340007.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/21340028.jpeg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/21350002.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/31150008l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/31150013l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/31150025.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/49500048_559883431106539_5663161701172772864_n.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/56100024.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/56610004.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/56610008.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/56610010.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/56610014.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/56690008l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/65300006.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/83690011.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/83720034al2.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/97390001.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/97410002l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/97450001l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/97460017.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/97470001.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/97470015lf.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/97890038al.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/97930001.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/97930003cfl.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/97930021l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/97950007.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/97950023l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/97960001.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/98020012.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/98040025.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/98070022.JPG',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/98070028l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/98100004l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/98100025l2.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/FH000001.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/FH000005l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/FH010002.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/FH200002l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/img0037l1.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R002-002al2fix.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08240-0000_0001l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08241-019Al2.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08241-035A.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08244-0002.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08245-004A.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08246-013A.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08246-023A.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08246-028A.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08246-034A.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08247-0005l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08247-0031l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08247-0034.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08252-001A.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08252-032Al.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08253-000A_0001l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08253-018A.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08254-0006.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08254-0007.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08254-0009.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08254-0023.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08254-0034l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08254-0035l.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        },
        {
            src: 'images/landscapes/old/R1-08255-0006.jpg',
            alt: 'Old Landscape',
            caption: 'Old Landscape'
        }
    ],
    'new': [
        {
            src: 'images/landscapes/new/_30_0058.jpeg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/000005010017l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/000005050005.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/000005050021l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/000012610004.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/000012630002l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/000013050012l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/000013050024.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/000013160018l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/000013160029l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/000013160032l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/000019070001l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/00010003lbw.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/00010005lbwblbwi.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/00020012.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/00030008.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/00030010.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/00030012l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/00040024.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/006_30Albwb1.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/03050001.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/03050009.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/031_6.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/13810001l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/13810003l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/13810004.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/22230010l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/22240021l1.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/23150024lf1.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/23150027l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/23150028l1.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/33330016.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/48170002.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/48200002.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/5877-27al.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/61880007.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/61890016.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/61890029.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/61890031.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/61890033.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/65160001.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/65840001.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/65840006.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/69480032.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/70020002.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/70020010lbwia.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/70020014l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/70980006l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/70980025.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/70980027.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/70980035.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/70990004l1.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/70990028l1.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/70990029l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/71690009l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/72410018.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/72410019.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/74550008.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/77750009.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/77760028.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/77770013.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/88000016cal.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/90270002.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/90450012l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/e__2818_29.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/e__2819_29.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/e__2825_29.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/e__283_29.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000001.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000003.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000004.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000005l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000010l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000011.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000011l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000013.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000013l1.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000018.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000019llbw.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000023l1.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000024l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000026.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1000029.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1010001l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1010008.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1010013_2.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1010013.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1010014l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1010015l1.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1010028.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1010029.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1010032l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1010034.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1020013l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1030002l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1030008.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1030017.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1030018.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1030028.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1030029.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1040003l1.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1040020.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1040023l.jpg',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/F1040024.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        },
        {
            src: 'images/landscapes/new/va__2810_29.JPG',
            alt: 'New Landscape',
            caption: 'New Landscape'
        }
    ]
};

// Track current category and lightbox state
let currentCategory = null;
let currentLightboxIndex = 0;
let currentGalleryImages = [];

document.addEventListener('DOMContentLoaded', function() {
    // Set up category link clicks
    initCategoryLinks();
    
    // Set up lightbox
    initLightbox();
    
    // If there's a hash in the URL, try to load that category
    const hash = window.location.hash.substring(1);
    if (hash && landscapeCategories[hash]) {
        showGallery(hash);
    }
    
    // Set current year in footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});

/**
 * Initialize category link click events
 */
function initCategoryLinks() {
    const categoryLinks = document.querySelectorAll('.category-link');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const category = this.dataset.category;
            if (category && landscapeCategories[category]) {
                // Update URL hash to enable direct linking to categories
                window.location.hash = category;
                showGallery(category);
            }
        });
    });
}

/**
 * Shows the gallery for the selected category
 * @param {string} category - Category name
 */
function showGallery(category) {
    // Update current category
    currentCategory = category;
    
    // Update current gallery images
    currentGalleryImages = landscapeCategories[category];
    
    // Get gallery container
    const galleryContainer = document.getElementById('landscape-gallery');
    
    // Clear existing gallery
    galleryContainer.innerHTML = '';
    
    // Add images to gallery
    currentGalleryImages.forEach((image, index) => {
        const galleryItem = createGalleryItem(image, index);
        galleryContainer.appendChild(galleryItem);
    });
    
    // Scroll to gallery
    galleryContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Creates a gallery item element with automatic orientation detection
 * @param {Object} image - Image data
 * @param {number} index - Image index for lightbox
 * @returns {HTMLElement} - Gallery item element
 */
function createGalleryItem(image, index) {
    // Create gallery item container with base class
    const item = document.createElement('div');
    item.className = 'portfolio-item'; // We'll add orientation class later
    item.dataset.index = index;
    
    // Create image element
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.alt;
    
    // Add onload event to determine image orientation
    img.onload = function() {
        // Determine orientation based on aspect ratio
        const ratio = this.naturalWidth / this.naturalHeight;
        
        if (ratio > 1.2) {
            item.classList.add('horizontal');
        } else if (ratio < 0.8) {
            item.classList.add('vertical');
        } else {
            item.classList.add('square');
        }
    };
    
    // Add error handling
    img.onerror = function() {
        console.error(`Failed to load image: ${image.src}`);
        item.classList.add('vertical'); // Default to vertical on error
    };
    
    // Create caption element
    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.textContent = image.caption;
    
    // Add click event for lightbox
    item.addEventListener('click', function() {
        openLightbox(index);
    });
    
    // Append elements to item
    item.appendChild(img);
    item.appendChild(caption);
    
    return item;
}

/**
 * Initializes the lightbox functionality
 */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    // Close lightbox when clicked outside of content
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // Close button click
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }
    
    // Previous button click
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navigateLightbox('prev');
        });
    }
    
    // Next button click
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navigateLightbox('next');
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox('prev');
        } else if (e.key === 'ArrowRight') {
            navigateLightbox('next');
        }
    });
}

/**
 * Opens the lightbox with the specified image
 * @param {number} index - Index of the image to display
 */
function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    if (!lightbox || !lightboxImg || !lightboxCaption || !currentGalleryImages.length) return;
    
    // Set current index
    currentLightboxIndex = index;
    
    // Get image data
    const image = currentGalleryImages[index];
    
    // Set image and caption
    lightboxImg.src = image.src;
    lightboxImg.alt = image.alt;
    lightboxCaption.textContent = image.caption;
    
    // Show lightbox
    lightbox.classList.add('active');
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

/**
 * Closes the lightbox
 */
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    
    if (!lightbox) return;
    
    // Hide lightbox
    lightbox.classList.remove('active');
    
    // Allow body scrolling
    document.body.style.overflow = '';
}

/**
 * Navigates to the previous or next image in the lightbox
 * @param {string} direction - Navigation direction ('prev' or 'next')
 */
function navigateLightbox(direction) {
    if (!currentGalleryImages.length) return;
    
    // Calculate new index
    let newIndex;
    
    if (direction === 'prev') {
        newIndex = (currentLightboxIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    } else {
        newIndex = (currentLightboxIndex + 1) % currentGalleryImages.length;
    }
    
    // Open lightbox with new index
    openLightbox(newIndex);
}