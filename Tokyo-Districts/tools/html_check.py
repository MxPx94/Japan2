import re
from pathlib import Path

p = Path('tokyo-districts.html')
s = p.read_text(encoding='utf-8')
# remove comments
s_nocom = re.sub(r'<!--.*?-->', '', s, flags=re.S)
# find tags
pattern = re.compile(r'<(/?)\s*([a-zA-Z0-9-]+)([^>]*)>', re.I)
self_closing = set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'])
stack = []
errors = []
line_starts = [0]
for m in re.finditer(r"\n", s_nocom):
    line_starts.append(m.end())

def lineno(pos):
    import bisect
    return bisect.bisect_right(line_starts, pos)

for m in pattern.finditer(s_nocom):
    closing = m.group(1) == '/'
    tag = m.group(2).lower()
    pos = m.start()
    ln = lineno(pos)
    if not closing:
        # check if self-closing via trailing slash
        attrs = m.group(3)
        if tag in self_closing or attrs.strip().endswith('/'):
            continue
        stack.append((tag, ln))
    else:
        if not stack:
            errors.append(f"Closing </{tag}> at line {ln} with empty stack")
        else:
            top_tag, top_ln = stack[-1]
            if top_tag == tag:
                stack.pop()
            else:
                # try find matching tag in stack
                for i in range(len(stack)-1, -1, -1):
                    if stack[i][0] == tag:
                        break
                else:
                    errors.append(f"Unmatched closing </{tag}> at line {ln}, top is </{top_tag}> from line {top_ln}")
                    continue
                # report unclosed tags above it
                unclosed = stack[i+1:]
                errors.append(f"Found </{tag}> at line {ln} but previous tags not closed: {', '.join(t for t,_ in unclosed)} (opened at lines {', '.join(str(l) for _,l in unclosed)})")
                # pop until tag
                stack = stack[:i]

# report
print('Tag nesting check for', p)
print('Total opening tags remaining on stack:', len(stack))
if stack:
    for tag, ln in stack:
        print('  Unclosed <' + tag + '> opened at line', ln)
if errors:
    print('\nErrors found:')
    for e in errors:
        print(' -', e)
else:
    print('No nesting errors detected.')

# counts
from collections import Counter
counts = Counter(t for t,_ in re.findall(r'<(/?)\s*([a-zA-Z0-9-]+)', s_nocom))
print('\nTag counts (approx):')
for tag, cnt in counts.items():
    print(tag, cnt)
