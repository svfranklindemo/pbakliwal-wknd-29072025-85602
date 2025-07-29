// modal.js
const getModal = (data) => `<div id="DIV_1">
    <div id="DIV_2">
        <button id="BUTTON_3">
            X
        </button>
    </div>
    <div id="DIV_4">
        <div id="DIV_8">
                        <section id="SECTION_9">
                            <div id="DIV_10">
                                <div id="DIV_11">
                                    <div id="DIV_12">
                                        <h2 id="H2_13">
                                            ${data?.offerType}
                                        </h2>
                                    </div>
                                    <div id="DIV_14">
                                        <h4 id="H4_15">
                                            ${data?.title?.strapline}
                                        </h4>
                                        <h3 id="H3_16">
                                            ${data?.title?.headline}
                                        </h3>
                                        <div id="DIV_17">
                                            <h5 id="H5_18">
                                                ${data?.model?.name}
                                            </h5>
                                            <h5 id="H5_19">
                                                ${data?.applicability}
                                            </h5>
                                        </div>
                                    </div>
                                    <div id="DIV_20">
                                        <section id="SECTION_21">
                                            <picture id="PICTURE_22" alt="${data?.model?.name}">
                                                <source id="SOURCE_23" media="(min-width: 1440px)" srcset="${data?.images?.detail?.largeStdRes}, ${data?.images?.detail?.largeHiRes}">
                                                <source id="SOURCE_24" media="(min-width: 768px)" srcset="${data?.images?.detail?.mediumStdRes}, ${data?.images?.detail?.mediumHiRes}">
                                                <source id="SOURCE_25" srcset="${data?.images?.detail?.smallStdRes}, ${data?.images?.detail?.smallHiRes}">
                                                <img id="IMG_26" alt="${data?.model?.name}" src="${data?.images?.detail?.smallStdRes}" tabindex="0">
                                            </picture>
                                            
                                            <p id="P_27">
                                                ${data?.images?.detail?.disclaimer}
                                            </p>
                                        </section>
                                    </div>
                                    <div id="DIV_28">
                                        <pre id="PRE_29">${data?.details}</pre>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section id="SECTION_30">
                            <div id="DIV_31">
                                <div id="DIV_32">
                                    <div id="DIV_33">
                                        ${data?.table?.details}
                                    </div>
                                </div>
                                <div id="DIV_34">
                                    <div id="DIV_35">
                                        <div id="DIV_36">
                                            <table id="TABLE_37">
                                                <tbody id="TBODY_38">
                                                <tr id="TR_39">
                                                    <td id="TD_40">
                                                        ${data?.table?.data?.[0]?.label}
                                                    </td>
                                                    <td id="TD_41">
                                                        ${data?.table?.data?.[0]?.value}
                                                    </td>
                                                </tr>
                                                <tr id="TR_42">
                                                    <td id="TD_43">
                                                        ${data?.table?.data?.[1]?.label}
                                                    </td>
                                                    <td id="TD_44">
                                                        ${data?.table?.data?.[1]?.value}
                                                    </td>
                                                </tr>
                                                <tr id="TR_45">
                                                    <td id="TD_46">
                                                        ${data?.table?.data?.[2]?.label}
                                                    </td>
                                                    <td id="TD_47">
                                                        ${data?.table?.data?.[2]?.value}
                                                    </td>
                                                </tr>
                                                <tr id="TR_48">
                                                    <td id="TD_49">
                                                        ${data?.table?.data?.[3]?.label}
                                                    </td>
                                                    <td id="TD_50">
                                                        ${data?.table?.data?.[3]?.value}
                                                    </td>
                                                </tr>
                                                <tr id="TR_51">
                                                    <td id="TD_52">
                                                        ${data?.table?.data?.[4]?.label}
                                                    </td>
                                                    <td id="TD_53">
                                                        ${data?.table?.data?.[4]?.value}
                                                    </td>
                                                </tr>
                                                <tr id="TR_54">
                                                    <td id="TD_55">
                                                        ${data?.table?.data?.[5]?.label}
                                                    </td>
                                                    <td id="TD_56">
                                                        ${data?.table?.data?.[5]?.value}
                                                    </td>
                                                </tr>
                                                <tr id="TR_57">
                                                    <td id="TD_58">
                                                        x${data?.table?.data?.[6]?.label}
                                                    </td>
                                                    <td id="TD_59">
                                                        ${data?.table?.data?.[6]?.value}
                                                    </td>
                                                </tr>
                                                <tr id="TR_60">
                                                    <td id="TD_61">
                                                        ${data?.table?.data?.[7]?.label}
                                                    </td>
                                                    <td id="TD_62">
                                                        ${data?.table?.data?.[7]?.value}
                                                    </td>
                                                </tr>
                                                <tr id="TR_63">
                                                    <td id="TD_64">
                                                        ${data?.table?.data?.[8]?.label}
                                                    </td>
                                                    <td id="TD_65">
                                                        ${data?.table?.data?.[8]?.value}
                                                    </td>
                                                </tr>
                                                <tr id="TR_66">
                                                    <td id="TD_67">
                                                        ${data?.table?.data?.[9]?.label}
                                                    </td>
                                                    <td id="TD_68">
                                                        ${data?.table?.data?.[9]?.value}
                                                    </td>
                                                </tr>
                                                <tr id="TR_69">
                                                    <td id="TD_70">
                                                        ${data?.table?.data?.[10]?.label}
                                                    </td>
                                                    <td id="TD_71">
                                                        ${data?.table?.data?.[10]?.value}
                                                    </td>
                                                </tr>
                                                <tr id="TR_72">
                                                    <td id="TD_73">
                                                        ${data?.table?.data?.[11]?.label}
                                                    </td>
                                                    <td id="TD_74">
                                                        ${data?.table?.data?.[11]?.value}
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section id="SECTION_75">
                            <div id="DIV_76">
                                <div id="DIV_77">
                                    <div id="DIV_78">
                                        <h2 id="H2_79">
                                            Next Steps
                                        </h2>
                                        <ul id="UL_80">
                                            <li id="LI_81">
                                                <a href="${data?.additionalCTAs?.[0]?.url}" target="_blank"" id="A_82">${data?.additionalCTAs?.[0]?.label}</a>
                                            </li>
                                            <li id="LI_83">
                                                <a href="${data?.additionalCTAs?.[1]?.url}" target="_blank" id="A_84">${data?.additionalCTAs?.[1]?.label}</a>
                                            </li>
                                            <li id="LI_85">
                                                <a href="${data?.CTA?.url}" target="_blank" id="A_86">${data?.CTA?.label}</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section id="SECTION_87">
                            <div id="DIV_88">
                                <div id="DIV_89">
                                    <h4 id="H4_90">
                                        ${data?.legals?.main?.headline}
                                    </h4>
                                    <p id="P_91">
                                        ${data?.legals?.main?.details}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
    </div>
</div>`;

class Modal {
  // eslint-disable-next-line no-useless-constructor,no-empty-function
  constructor() {}

  show(data) {
    console.log('data: ', data);
    this.modalContainer = document.getElementById('modal-container');
    const modal = document.createElement('div');

    modal.classList.add('offer-modal-container');
      let dataStr = JSON.stringify(data);
      dataStr = dataStr.replaceAll("Nissan LEAF","");
      dataStr = dataStr.replaceAll("NISSAN LEAF","");
      dataStr = dataStr.replaceAll("Nissan ","Carvelo ");
      dataStr = dataStr.replaceAll("NISSAN ","Carvelo ");
      dataStr = dataStr.replaceAll(/Nissan’s/g, "Carvelo’s");
      dataStr = dataStr.replaceAll("NissanConnect ","Carvelo ");
      dataStr = dataStr.replaceAll('https://www.nissan.co.uk/ownership/nissan-infotainment-system/android-auto-apple-carplay.html','https://www.carvelo.co.uk/ownership/carvelo-infotainment-system/android-auto-apple-carplay.html')
      modal.innerHTML = getModal(JSON.parse(dataStr));

    this.modalContainer.appendChild(modal);

    document.body.classList.add('no-scroll');

    // Trigger reflow to apply the initial styles before adding the show class
    // eslint-disable-next-line no-unused-expressions,no-void
    void modal.offsetWidth;
    modal.classList.add('show');

    // Use a small delay to ensure the modal is in the DOM before adding the show class
    setTimeout(() => {
      modal.classList.add('slideInFromRight');
    }, 100);

    const closeButton = modal.querySelector('#BUTTON_3');
    closeButton.addEventListener('click', () => this.hide(modal));
  }

  // eslint-disable-next-line class-methods-use-this
  hide(modal) {
    modal.classList.add('fade-out');

    modal.addEventListener('animationend', () => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      document.body.classList.remove('no-scroll');
    }, { once: true });
  }
}

export default Modal;
