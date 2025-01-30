import { useNylas } from '@nylas/nylas-react';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import IconDelete from './components/icons/IconDelete.jsx';
import {Editor} from '@tinymce/tinymce-react';

// Import fetchEventSource dynamically
const fetchEventSourcePromise = import("https://unpkg.com/@microsoft/fetch-event-source@2.0.1/lib/esm/index.js")
  .then(module => module.fetchEventSource);

function SendEmails({
  userId,
  draftEmail,
  setDraftEmail,
  onEmailSent,
  setToastNotification,
  discardComposer,
  style,
}) {
  const nylas = useNylas();

  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const data = [
    {
      title: 'Quick replies',
      items: [
        {
          title: 'Message received',
          content: '<p dir="ltr">Hey {{Customer.FirstName}}!</p>\n<p dir="ltr">Just a quick note to say we&rsquo;ve received your message, and will get back to you within 48 hours.</p>\n<p dir="ltr">For reference, your ticket number is: {{Ticket.Number}}</p>\n<p dir="ltr">Should you have any questions in the meantime, just reply to this email and it will be attached to this ticket.</p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">Regards,</p>\n<p dir="ltr">{{Agent.FirstName}}</p>'
        },
        {
          title: 'Thanks for the feedback',
          content: '<p dir="ltr">Hi {{Customer.FirstName}},</p>\n<p dir="ltr">We appreciate you taking the time to provide feedback on {{Product.Name}}.</p>\n<p dir="ltr">It sounds like it wasn&rsquo;t able to fully meet your expectations, for which we apologize. Rest assured our team looks at each piece of feedback and uses it to decide what to focus on next with {{Product.Name}}.</p>\n<p dir="ltr"><strong>&nbsp;</strong></p>\n<p dir="ltr">All the best, and let us know if there&rsquo;s anything else we can do to help.</p>\n<p dir="ltr">-{{Agent.FirstName}}</p>'
        },
        {
          title: 'Still working on case',
          content: '<p dir="ltr"><img src="https://lh4.googleusercontent.com/-H7w_COxrsy2fVpjO6RRnoBsujhaLyg6AXux5zidqmQ_ik1mrE6BtnaTUdWYQuVbtKpviRqQiuPBOHNGUsEXvrRliEHc4-hKDrCLgQQ9Co-MI4uY2ehUvYtU1nn3EeS0WiUzST-7MQB2Z5YFXrMDwRk" width="320" height="240"></p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">Hi {{Customer.FirstName}},</p>\n<p dir="ltr">Just a quick note to let you know we&rsquo;re still working on your case. It&rsquo;s taking a bit longer than we hoped, but we&rsquo;re aiming to get you an answer in the next 48 hours.</p>\n<p dir="ltr">Stay tuned,</p>\n<p dir="ltr">{{Agent.FirstName}}</p>'
        }
      ]
    },
    {
      title: 'Closing tickets',
      items: [
        {
          title: 'Closing ticket',
          content: '<p dir="ltr">Hi {{Customer.FirstName}},</p>\n<p dir="ltr">We haven&rsquo;t heard back from you in over a week, so we have gone ahead and closed your ticket number {{Ticket.Number}}.</p>\n<p dir="ltr">If you&rsquo;re still running into issues, not to worry, just reply to this email and we will re-open your ticket.</p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">All the best,</p>\n<p dir="ltr">{{Agent.FirstName}}</p>'
        },
        {
          title: 'Post-call survey',
          content: '<p dir="ltr">Hey {{Customer.FirstName}}!</p>\n<p dir="ltr">&nbsp;</p>\n<p dir="ltr">How did we do?</p>\n<p dir="ltr">If you have a few moments, we&rsquo;d love you to fill out our post-support survey: {{Survey.Link}}</p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">Thanks in advance!<br>{{Company.Name}} Customer Support</p>'
        }
      ]
    },
    {
      title: 'Product support',
      items: [
        {
          title: 'How to find model number',
          content: '<p dir="ltr">Hi {{Customer.FirstName}},</p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">My name is {{Agent.FirstName}} and I will be glad to assist you today.</p>\n<p dir="ltr">To troubleshoot your issue, we first need your model number, which can be found on the underside of your product beneath the safety warning label.&nbsp;</p>\n<p dir="ltr">It should look something like the following: XX.XXXXX.X</p>\n<p dir="ltr">Once you send it over, I will advise on next steps.</p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">Thanks!</p>\n<p dir="ltr">{{Agent.FirstName}}</p>'
        },
        {
          title: 'Support escalation',
          content: '<p dir="ltr"><img src="https://lh3.googleusercontent.com/z4hleIymnERrS9OQQMBwmkqVne8kYZA0Kly9Ny64pp4fi47CWWUy30Q0-UkjGf-K-50zrfR-wltHUTbExzZ7VUSUAUG60Fll5f2E0UZcKjKoa-ZVlIcuOoe-RRckFWqiihUOfVds7pXtM8Y59uy2hpw" width="295" height="295"></p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">Hi {{Customer.FirstName}},</p>\n<p dir="ltr">We have escalated your ticket {{Ticket.Number}} to second-level support.</p>\n<p dir="ltr">You should hear back from the new agent on your case, {{NewAgent.FirstName}}, shortly.</p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">Thanks,</p>\n<p dir="ltr">{{Company.Name}} Customer Support</p>'
        }
      ]
    }
  ];
  
  const create = (data = []) => {
    const store = { items: [] }
  
    let id = 0;
    const genId = () => (++id).toString()
    const categoryIndex = {}
    const templateIndex = {}
  
    const getParent = (id) =>
      typeof id === 'undefined' ? store : getCategory(id);
  
    const list = () => [...store.items]
  
    const getCategory = (id) => categoryIndex[id]
  
    const createCategory = (title) => {
      const id = genId()
      const category = {
        id,
        title,
        items: []
      }
      categoryIndex[id] = category;
      store.items = [...store.items, category]
      return category
    }
  
    const createTemplate = (title, content, categoryId) => {
      const id = genId()
      const template = {
        id,
        title,
        content,
      }
      const parent = getParent(categoryId)
      parent.items = [...parent.items, template]
      templateIndex[id] = [template, categoryId];
      return template
    }
  
    const load = (items, id) => {
      for (const item of items) {
        if (item.items) {
          const category = createCategory(item.title);
          load(item.items, category.id );
        } else {
          createTemplate(item.title, item.content, id);
        }
      }
    };
  
    load(data);
  
    return { list }
  }
  
  const list = create(data).list();
  const advtemplate_list = async () => list

  // console.log(129, store.list())

  useEffect(() => {
    setTo(draftEmail.to);
    setSubject(draftEmail.subject);
    setBody(draftEmail.body);
  }, []);

  useEffect(() => {
    const updateTimer = setTimeout(function () {
      const currentDate = new Date();
      const draftUpdates = {
        to: to,
        subject,
        body,
        last_message_timestamp: Math.floor(currentDate.getTime() / 1000),
      };
      setDraftEmail(draftUpdates);
    }, 500);
    return () => clearTimeout(updateTimer);
  }, [to, subject, body]);

  const sendEmail = async ({ userId, to, body }) => {
    try {
      const url = nylas.serverBaseUrl + '/nylas/send-email';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: userId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...draftEmail, to, subject, body }),
      });

      if (!res.ok) {
        setToastNotification('error');
        throw new Error(res.statusText);
      }

      const data = await res.json();

      return data;
    } catch (error) {
      console.warn(`Error sending emails:`, error);
      setToastNotification('error');

      return false;
    }
  };

  const send = async (e) => {
    e.preventDefault();

    if (!userId) {
      return;
    }
    setIsSending(true);
    const message = await sendEmail({ userId, to, body });
    console.log('message sent', message);
    setIsSending(false);
    onEmailSent();
  };

  const [value, setValue] = useState('');
  const initialValue = ''

  // Configure AI request function
  const ai_request = (request, respondWith) => {
    respondWith.stream((signal, streamMessage) => {
      // Adds each previous query and response as individual messages
      const conversation = request.thread.flatMap((event) => {
        if (event.response) {
          return [
            { role: 'user', content: event.request.query },
            { role: 'assistant', content: event.response.data }
          ];
        } else {
          return [];
        }
      });

      // System messages provided by the plugin to format the output as HTML content.
      const pluginSystemMessages = request.system.map((content) => ({
        role: 'system',
        content
      }));

      const systemMessages = [
        ...pluginSystemMessages,
        // Additional system messages to control the output of the AI
        { role: 'system', content: 'Remove lines with ``` from the response start and response end.' }
      ]

      // Forms the new query sent to the API
      const content = request.context.length === 0 || conversation.length > 0
        ? request.query
        : `Question: ${request.query} Context: """${request.context}"""`;

      const messages = [
        ...conversation,
        ...systemMessages,
        { role: 'user', content }
      ];

      const requestBody = {
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 800,
        messages,
        stream: true
      };

      const openAiOptions = {
        signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      };

      const onopen = async (response) => {
        if (response) {
          const contentType = response.headers.get('content-type');
          if (response.ok && contentType?.includes('text/event-stream')) {
            return;
          } else if (contentType?.includes('application/json')) {
            const data = await response.json();
            if (data.error) {
              throw new Error(`${data.error.type}: ${data.error.message}`);
            }
          }
        } else {
          throw new Error('Failed to communicate with the ChatGPT API');
        }
      };

      const onmessage = (ev) => {
        const data = ev.data;
        if (data !== '[DONE]') {
          const parsedData = JSON.parse(data);
          const firstChoice = parsedData?.choices[0];
          const message = firstChoice?.delta?.content;
          if (message) {
            streamMessage(message);
          }
        }
      };

      const onerror = (error) => {
        setToastNotification({
          type: 'error',
          message: 'AI request failed: ' + error.message,
          show: true,
        });
        throw error;
      };

      return fetchEventSourcePromise
        .then(fetchEventSource =>
          fetchEventSource('https://api.openai.com/v1/chat/completions', {
            ...openAiOptions,
            openWhenHidden: true,
            onopen,
            onmessage,
            onerror
          })
        )
        .then(async (response) => {
          if (response && !response.ok) {
            const data = await response.json();
            if (data.error) {
              throw new Error(`${data.error.type}: ${data.error.message}`);
            }
          }
        })
        .catch(onerror);
    });
  };

  return (
    <form onSubmit={send} className={`email-compose-view ${style}`}>
      {!style && <h3 className="title">New message</h3>}
      <div className="input-container">
        <label className="input-label" htmlFor="To">
          To
        </label>
        <input
          aria-label="To"
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        {!style && (
          <>
            <div className="line"></div>

            <label className="input-label" htmlFor="Subject">
              Subject
            </label>
            <input
              aria-label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <div className="line"></div>
          </>
        )}
      </div>
          <Editor
            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
            initialValue={initialValue}
            value={value}
            onEditorChange={(newValue) => {
              setValue(newValue)
              setBody(newValue)
            }}
            init={{
              plugins: 'lists link image table advcode help casechange mergetags inlinecss advtemplate tinymcespellchecker a11ychecker ai',
              toolbar: 'formatgroup  | mergetags inserttemplate | link image table code | spellcheckdialog a11ycheck | aidialog aishortcuts help',
              menubar: false,
              statusbar: false,
              toolbar_location: 'bottom',
              toolbar_groups: {
                formatgroup: {
                  icon: 'format',
                  tooltip: 'Formatting',
                  items:
                    'fontfamily fontsize | bold italic underline strikethrough forecolor | align outdent indent'
                }
              },
              icon: 'format',
              tooltip: 'Formatting',
              contextmenu: 'advtemplate',
              advcode_inline: true,
              advtemplate_templates: data,
              content_style: `
                .tox-dialog {
                  max-width: 90% !important;
                  width: 800px !important;
                }
                .tox-dialog__body-content {
                  max-height: 60vh !important;
                  overflow-y: auto !important;
                }
                .email-template {
                  font-family: Arial, sans-serif;
                  max-width: 600px;
                  margin: 0 auto;
                }
                .header {
                  background: linear-gradient(135deg, #0077B6 0%, #00B4D8 100%);
                  color: white;
                  padding: 20px;
                  border-radius: 8px 8px 0 0;
                  text-align: center;
                }
                .content {
                  padding: 20px;
                  background: #ffffff;
                  border: 1px solid #e0e0e0;
                }
                .highlight {
                  background-color: #90E0EF;
                  padding: 2px 5px;
                  border-radius: 3px;
                }
                .footer {
                  text-align: center;
                  padding: 15px;
                  background: #f8f9fa;
                  border-radius: 0 0 8px 8px;
                  font-size: 0.9em;
                  color: #666;
                }
              `,
              ai_request,
              mergetags_list: [
                { value: 'First.Name', title: 'First Name' },
                { value: 'Email', title: 'Email' },
                {
                  value: 'Current.Date',
                  title: 'Current date in DD/MM/YYYY format'
                },
                {
                  value: 'Current.Time',
                },
                {
                  title: 'Person',
                  menu: [
                    {
                      value: 'Person.Name.First',
                      title: 'first name'
                    },
                    {
                      value: 'Person.Name.Last',
                      title: 'last name'
                    },
                    {
                      value: 'Person.Name.Full',
                      title: 'full name'
                    },
                    {
                      title: 'Email',
                      menu: [
                        {
                          value: 'Person.Email.Work'
                        },
                        {
                          value: 'Person.Email.Home'
                        }
                      ]
                    }
                  ]
                }
              ],
              spellchecker_language: 'en_US',
              width: '100%',
              height: 500,
            }}
          />
      <div className="composer-button-group">
        {/* <button
          type="button"
          className="secondary"
          onClick={() => {
            const editor = tinymce.get(0);
            const pluginAPI = editor.plugins.inlinecss;
            pluginAPI.getContent().then((content) => {
              navigator.clipboard.writeText(content.html).then(() => {
                setToastNotification({
                  type: 'success',
                  message: 'HTML with inline CSS copied to clipboard!',
                  show: true,
                });
                setTimeout(() => {
                  setToastNotification(null);
                }, 3000);
              }).catch(err => {
                setToastNotification({
                  type: 'error',
                  message: 'Failed to copy to clipboard',
                  show: true,
                });
                setTimeout(() => {
                  setToastNotification(null);
                }, 3000);
              });
            });
          }}
        >
          Copy HTML with Inline CSS
        </button> */}
        <button
          className="primary"
          disabled={!to || !body || isSending}
          type="submit"
        >
          {isSending ? 'Sending...' : 'Send email'}
        </button>
        <button className="icon" onClick={discardComposer}>
          <IconDelete />
        </button>
      </div>
    </form>
  );
}

SendEmails.propTypes = {
  userId: PropTypes.string.isRequired,
  draftEmail: PropTypes.object.isRequired,
  setDraftEmail: PropTypes.func.isRequired,
  onEmailSent: PropTypes.func.isRequired,
  setToastNotification: PropTypes.func.isRequired,
  discardComposer: PropTypes.func.isRequired,
  style: PropTypes.string,
};

export default SendEmails;